/**
 * Consistency checker for mind maps
 * Detects contradictions, redundancies, and logical issues
 */

import type { MindMap, MindMapBranch } from '../types/mindmap';
import { MindMapGraph } from './graph';

export interface Contradiction {
  type: 'contradiction';
  severity: 'high' | 'medium' | 'low';
  concept1: string;
  concept2: string;
  reason: string;
  suggestion?: string;
}

export interface Redundancy {
  type: 'redundancy';
  severity: 'high' | 'medium' | 'low';
  concepts: string[];
  similarity: number;
  suggestion: string;
}

export interface HierarchyIssue {
  type: 'hierarchy';
  severity: 'high' | 'medium' | 'low';
  parent: string;
  child: string;
  reason: string;
  suggestion?: string;
}

export interface Gap {
  type: 'gap';
  severity: 'high' | 'medium' | 'low';
  branch: string;
  reason: string;
  suggestions: string[];
}

export type ConsistencyIssue = Contradiction | Redundancy | HierarchyIssue | Gap;

export interface ConsistencyReport {
  score: number; // 0-100
  issues: ConsistencyIssue[];
  statistics: {
    totalNodes: number;
    branchCount: number;
    avgBranchDepth: number;
    balanceScore: number;
  };
}

export class ConsistencyChecker {
  private mindMap: MindMap;
  private graph: MindMapGraph;

  // Common contradictory word pairs
  private contradictions = [
    ['increase', 'decrease'],
    ['save', 'spend'],
    ['expand', 'reduce'],
    ['grow', 'shrink'],
    ['more', 'less'],
    ['add', 'remove'],
    ['start', 'stop'],
    ['open', 'close'],
    ['gain', 'lose'],
    ['fast', 'slow'],
    ['big', 'small'],
    ['always', 'never'],
    ['success', 'failure'],
  ];

  constructor(mindMap: MindMap) {
    this.mindMap = mindMap;
    this.graph = new MindMapGraph(mindMap);
  }

  /**
   * Run full consistency check
   */
  check(): ConsistencyReport {
    const issues: ConsistencyIssue[] = [
      ...this.detectContradictions(),
      ...this.findRedundancies(),
      ...this.validateHierarchy(),
      ...this.checkCompleteness()
    ];

    const statistics = this.calculateStatistics();
    const score = this.calculateScore(issues, statistics);

    return {
      score,
      issues,
      statistics
    };
  }

  /**
   * Detect logical contradictions
   */
  detectContradictions(): Contradiction[] {
    const contradictions: Contradiction[] = [];
    const allConcepts = this.getAllConcepts();

    for (let i = 0; i < allConcepts.length; i++) {
      for (let j = i + 1; j < allConcepts.length; j++) {
        const concept1 = allConcepts[i].toLowerCase();
        const concept2 = allConcepts[j].toLowerCase();

        // Check for contradictory word pairs
        for (const [word1, word2] of this.contradictions) {
          if (
            (concept1.includes(word1) && concept2.includes(word2)) ||
            (concept1.includes(word2) && concept2.includes(word1))
          ) {
            contradictions.push({
              type: 'contradiction',
              severity: 'medium',
              concept1: allConcepts[i],
              concept2: allConcepts[j],
              reason: `Concepts contain contradictory terms: "${word1}" vs "${word2}"`,
              suggestion: `Review if both "${allConcepts[i]}" and "${allConcepts[j]}" are needed, or clarify their relationship`
            });
          }
        }

        // Check for negations
        if (
          (concept1.includes('not ') && concept2.replace('not ', '') === concept1.replace('not ', '')) ||
          (concept2.includes('not ') && concept1.replace('not ', '') === concept2.replace('not ', ''))
        ) {
          contradictions.push({
            type: 'contradiction',
            severity: 'high',
            concept1: allConcepts[i],
            concept2: allConcepts[j],
            reason: 'Direct negation of another concept',
            suggestion: 'Choose one direction or clarify when each applies'
          });
        }
      }
    }

    return contradictions;
  }

  /**
   * Find redundant or duplicate concepts
   */
  findRedundancies(): Redundancy[] {
    const redundancies: Redundancy[] = [];
    const allConcepts = this.getAllConcepts();

    for (let i = 0; i < allConcepts.length; i++) {
      for (let j = i + 1; j < allConcepts.length; j++) {
        const similarity = this.calculateTextSimilarity(
          allConcepts[i],
          allConcepts[j]
        );

        if (similarity > 0.7) {
          redundancies.push({
            type: 'redundancy',
            severity: similarity > 0.9 ? 'high' : 'medium',
            concepts: [allConcepts[i], allConcepts[j]],
            similarity,
            suggestion: similarity > 0.9
              ? 'These concepts are nearly identical - consider merging them'
              : 'These concepts are very similar - clarify their differences or combine them'
          });
        }
      }
    }

    return redundancies;
  }

  /**
   * Validate hierarchy relationships
   */
  validateHierarchy(): HierarchyIssue[] {
    const issues: HierarchyIssue[] = [];

    // Check if sub-branches are too general compared to parent
    this.mindMap.branches.forEach((branch) => {
      branch.subBranches.forEach((subBranch) => {
        // Check if subbranch contains parent branch title (should be more specific)
        if (subBranch.toLowerCase().includes(branch.title.toLowerCase())) {
          issues.push({
            type: 'hierarchy',
            severity: 'low',
            parent: branch.title,
            child: subBranch,
            reason: 'Sub-branch might be redundant with parent branch',
            suggestion: 'Make sub-branch more specific or merge with parent'
          });
        }

        // Check for very short sub-branches (might be incomplete)
        if (subBranch.split(' ').length < 2) {
          issues.push({
            type: 'hierarchy',
            severity: 'low',
            parent: branch.title,
            child: subBranch,
            reason: 'Sub-branch is very brief',
            suggestion: 'Consider adding more detail or context'
          });
        }
      });
    });

    return issues;
  }

  /**
   * Check for gaps and missing information
   */
  checkCompleteness(): Gap[] {
    const gaps: Gap[] = [];

    // Check branch balance
    const branchSizes = this.mindMap.branches.map(b => b.subBranches.length);
    const avgSize = branchSizes.reduce((a, b) => a + b, 0) / branchSizes.length;
    const stdDev = Math.sqrt(
      branchSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / branchSizes.length
    );

    this.mindMap.branches.forEach((branch, idx) => {
      const size = branch.subBranches.length;

      // Branch is much smaller than average
      if (size < avgSize - stdDev && size < 3) {
        gaps.push({
          type: 'gap',
          severity: 'medium',
          branch: branch.title,
          reason: `Branch has fewer sub-topics (${size}) than average (${Math.round(avgSize)})`,
          suggestions: [
            `Add more specific aspects of "${branch.title}"`,
            'Consider breaking down the concept further',
            'Add practical examples or applications'
          ]
        });
      }

      // Branch has no sub-branches
      if (size === 0) {
        gaps.push({
          type: 'gap',
          severity: 'high',
          branch: branch.title,
          reason: 'Branch has no sub-topics',
          suggestions: [
            'Add at least 2-3 sub-topics to develop this branch',
            'Consider if this branch should be a sub-topic of another branch'
          ]
        });
      }

      // Branch has too many sub-branches (might need restructuring)
      if (size > avgSize + stdDev * 2 && size > 8) {
        gaps.push({
          type: 'gap',
          severity: 'low',
          branch: branch.title,
          reason: `Branch has many sub-topics (${size}) - might benefit from grouping`,
          suggestions: [
            'Consider creating sub-categories within this branch',
            'Group related sub-topics together',
            'Some sub-topics might deserve their own branches'
          ]
        });
      }
    });

    return gaps;
  }

  /**
   * Calculate overall consistency score
   */
  private calculateScore(issues: ConsistencyIssue[], statistics: any): number {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    // Bonus for good balance
    if (statistics.balanceScore > 0.8) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate statistics
   */
  private calculateStatistics() {
    const branchSizes = this.mindMap.branches.map(b => b.subBranches.length);
    const totalSubBranches = branchSizes.reduce((a, b) => a + b, 0);
    const avgBranchDepth = totalSubBranches / this.mindMap.branches.length;

    // Calculate balance score (0-1, higher is more balanced)
    const avgSize = avgBranchDepth;
    const variance = branchSizes.reduce((sum, size) =>
      sum + Math.pow(size - avgSize, 2), 0) / branchSizes.length;
    const balanceScore = Math.max(0, 1 - (variance / (avgSize * avgSize)));

    return {
      totalNodes: this.graph.getAllNodes().length,
      branchCount: this.mindMap.branches.length,
      avgBranchDepth,
      balanceScore
    };
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

  /**
   * Calculate text similarity using Jaccard similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}
