/**
 * Semantic analyzer for mind maps
 * Uses both text-based similarity and AI embeddings for concept analysis
 */

import type { MindMap } from '../types/mindmap';
import { MindMapGraph, type GraphNode } from './graph';

export interface ConceptSimilarity {
  concept1: string;
  concept2: string;
  similarity: number;
  method: 'text' | 'embedding';
}

export interface ConceptCluster {
  id: number;
  concepts: string[];
  theme: string;
  coherence: number;
}

export interface SuggestedConnection {
  from: string;
  to: string;
  reason: string;
  confidence: number;
}

export interface SemanticAnalysisResult {
  similarities: ConceptSimilarity[];
  clusters: ConceptCluster[];
  suggestedConnections: SuggestedConnection[];
  relatedConcepts: Map<string, string[]>;
}

export class SemanticAnalyzer {
  private mindMap: MindMap;
  private graph: MindMapGraph;
  private embeddings: Map<string, number[]> | null = null;

  constructor(mindMap: MindMap) {
    this.mindMap = mindMap;
    this.graph = new MindMapGraph(mindMap);
  }

  /**
   * Run full semantic analysis
   */
  async analyze(useAI: boolean = false): Promise<SemanticAnalysisResult> {
    // Generate embeddings if AI mode is enabled
    if (useAI) {
      await this.generateEmbeddings();
    }

    const similarities = this.findSimilarConcepts();
    const clusters = this.identifyClusters();
    const suggestedConnections = this.suggestNewConnections(similarities);
    const relatedConcepts = this.buildRelatedConceptsMap(similarities);

    return {
      similarities,
      clusters,
      suggestedConnections,
      relatedConcepts
    };
  }

  /**
   * Generate embeddings using Gemini API
   */
  private async generateEmbeddings(): Promise<void> {
    try {
      const concepts = this.getAllConcepts();
      const embeddings = new Map<string, number[]>();

      // Call Gemini embedding API
      const response = await fetch('/api/generate-embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: concepts })
      });

      if (response.ok) {
        const data = await response.json();
        data.embeddings.forEach((embedding: number[], idx: number) => {
          embeddings.set(concepts[idx], embedding);
        });
        this.embeddings = embeddings;
      }
    } catch (error) {
      console.warn('Failed to generate embeddings, falling back to text similarity:', error);
      this.embeddings = null;
    }
  }

  /**
   * Find similar concepts across the mind map
   */
  private findSimilarConcepts(): ConceptSimilarity[] {
    const concepts = this.getAllConcepts();
    const similarities: ConceptSimilarity[] = [];

    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const similarity = this.embeddings
          ? this.cosineSimilarity(
              this.embeddings.get(concepts[i])!,
              this.embeddings.get(concepts[j])!
            )
          : this.textSimilarity(concepts[i], concepts[j]);

        // Only include moderately similar concepts (not too similar = redundant)
        if (similarity > 0.3 && similarity < 0.8) {
          similarities.push({
            concept1: concepts[i],
            concept2: concepts[j],
            similarity,
            method: this.embeddings ? 'embedding' : 'text'
          });
        }
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Identify thematic clusters
   */
  private identifyClusters(): ConceptCluster[] {
    const graphClusters = this.graph.findClusters();
    const clusterMap = new Map<number, string[]>();

    // Group concepts by cluster
    graphClusters.forEach((clusterId, nodeId) => {
      const node = this.graph.getNode(nodeId);
      if (node && node.type !== 'central') {
        if (!clusterMap.has(clusterId)) {
          clusterMap.set(clusterId, []);
        }
        clusterMap.get(clusterId)!.push(node.label);
      }
    });

    // Convert to cluster objects
    const clusters: ConceptCluster[] = [];
    clusterMap.forEach((concepts, id) => {
      if (concepts.length > 1) {
        clusters.push({
          id,
          concepts,
          theme: this.identifyTheme(concepts),
          coherence: this.calculateClusterCoherence(concepts)
        });
      }
    });

    return clusters.sort((a, b) => b.coherence - a.coherence);
  }

  /**
   * Suggest new connections between concepts
   */
  private suggestNewConnections(similarities: ConceptSimilarity[]): SuggestedConnection[] {
    const suggestions: SuggestedConnection[] = [];

    // Find concepts in different branches that are similar
    similarities.slice(0, 10).forEach(sim => {
      const node1 = this.findNodeByConcept(sim.concept1);
      const node2 = this.findNodeByConcept(sim.concept2);

      if (node1 && node2) {
        // Check if they're in different branches
        if (node1.branchIndex !== node2.branchIndex) {
          const distance = this.graph.calculateDistance(node1.id, node2.id);

          suggestions.push({
            from: sim.concept1,
            to: sim.concept2,
            reason: `These concepts are semantically related (${Math.round(sim.similarity * 100)}% similar) but in different branches`,
            confidence: sim.similarity
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Build map of related concepts for quick lookup
   */
  private buildRelatedConceptsMap(similarities: ConceptSimilarity[]): Map<string, string[]> {
    const relatedMap = new Map<string, string[]>();

    similarities.forEach(sim => {
      // Add concept2 to concept1's related list
      if (!relatedMap.has(sim.concept1)) {
        relatedMap.set(sim.concept1, []);
      }
      relatedMap.get(sim.concept1)!.push(sim.concept2);

      // Add concept1 to concept2's related list
      if (!relatedMap.has(sim.concept2)) {
        relatedMap.set(sim.concept2, []);
      }
      relatedMap.get(sim.concept2)!.push(sim.concept1);
    });

    return relatedMap;
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    return mag1 === 0 || mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
  }

  /**
   * Calculate text similarity using multiple methods
   */
  private textSimilarity(text1: string, text2: string): number {
    // Combine Jaccard and n-gram similarity
    const jaccard = this.jaccardSimilarity(text1, text2);
    const ngram = this.ngramSimilarity(text1, text2, 2);

    return (jaccard + ngram) / 2;
  }

  /**
   * Jaccard similarity
   */
  private jaccardSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * N-gram similarity
   */
  private ngramSimilarity(text1: string, text2: string, n: number): number {
    const ngrams1 = this.getNgrams(text1.toLowerCase(), n);
    const ngrams2 = this.getNgrams(text2.toLowerCase(), n);

    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);

    const intersection = new Set([...set1].filter(ng => set2.has(ng)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Get n-grams from text
   */
  private getNgrams(text: string, n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n));
    }
    return ngrams;
  }

  /**
   * Identify theme from concepts
   */
  private identifyTheme(concepts: string[]): string {
    // Extract common words (excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const wordFreq = new Map<string, number>();

    concepts.forEach(concept => {
      concept.toLowerCase().split(/\s+/).forEach(word => {
        if (!stopWords.has(word) && word.length > 3) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    // Find most common word
    let maxFreq = 0;
    let theme = concepts[0]; // Default to first concept

    wordFreq.forEach((freq, word) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        theme = word.charAt(0).toUpperCase() + word.slice(1);
      }
    });

    return theme;
  }

  /**
   * Calculate cluster coherence
   */
  private calculateClusterCoherence(concepts: string[]): number {
    if (concepts.length < 2) return 0;

    let totalSimilarity = 0;
    let count = 0;

    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        totalSimilarity += this.textSimilarity(concepts[i], concepts[j]);
        count++;
      }
    }

    return count === 0 ? 0 : totalSimilarity / count;
  }

  /**
   * Find graph node by concept text
   */
  private findNodeByConcept(concept: string): GraphNode | null {
    const nodes = this.graph.getAllNodes();
    return nodes.find(n => n.label === concept) || null;
  }

  /**
   * Get all concepts as flat array
   */
  private getAllConcepts(): string[] {
    const concepts: string[] = [this.mindMap.centralIdea];

    this.mindMap.branches.forEach(branch => {
      concepts.push(branch.title);
      concepts.push(...branch.subBranches);
    });

    return concepts;
  }
}
