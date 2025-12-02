/**
 * Graph utilities and data structures for mind map analysis
 */

import type { MindMap, MindMapBranch } from '../types/mindmap';

export interface GraphNode {
  id: string;
  label: string;
  type: 'central' | 'branch' | 'subbranch';
  branchIndex?: number;
  subBranchIndex?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface Path {
  nodes: GraphNode[];
  distance: number;
  strength: number;
}

export class MindMapGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  adjacencyList: Map<string, Set<string>>;

  constructor(mindMap: MindMap) {
    this.nodes = new Map();
    this.edges = [];
    this.adjacencyList = new Map();
    this.buildGraph(mindMap);
  }

  private buildGraph(mindMap: MindMap): void {
    // Create central node
    const centralId = 'central';
    this.nodes.set(centralId, {
      id: centralId,
      label: mindMap.centralIdea,
      type: 'central'
    });
    this.adjacencyList.set(centralId, new Set());

    // Create branch and subbranch nodes
    mindMap.branches.forEach((branch, branchIndex) => {
      const branchId = `branch-${branchIndex}`;

      this.nodes.set(branchId, {
        id: branchId,
        label: branch.title,
        type: 'branch',
        branchIndex
      });

      this.adjacencyList.set(branchId, new Set());

      // Connect central to branch
      this.addEdge(centralId, branchId, 1.0);

      // Create subbranch nodes
      branch.subBranches.forEach((subBranch, subIndex) => {
        const subId = `branch-${branchIndex}-sub-${subIndex}`;

        this.nodes.set(subId, {
          id: subId,
          label: subBranch,
          type: 'subbranch',
          branchIndex,
          subBranchIndex: subIndex
        });

        this.adjacencyList.set(subId, new Set());

        // Connect branch to subbranch
        this.addEdge(branchId, subId, 1.0);
      });
    });
  }

  private addEdge(from: string, to: string, weight: number): void {
    this.edges.push({ from, to, weight });
    this.adjacencyList.get(from)?.add(to);
    this.adjacencyList.get(to)?.add(from); // Undirected graph
  }

  /**
   * Find the shortest path between two nodes using BFS
   */
  findShortestPath(startId: string, endId: string): Path | null {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
      return null;
    }

    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startId, path: [startId] }
    ];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === endId) {
        const nodes = path.map(id => this.nodes.get(id)!);
        return {
          nodes,
          distance: path.length - 1,
          strength: 1 / (path.length - 1) // Shorter path = stronger connection
        };
      }

      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor]
          });
        }
      }
    }

    return null;
  }

  /**
   * Find all paths between two nodes using DFS
   */
  findAllPaths(startId: string, endId: string, maxDepth: number = 10): Path[] {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
      return [];
    }

    const allPaths: Path[] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[], depth: number) => {
      if (depth > maxDepth) return;

      if (currentId === endId) {
        const nodes = path.map(id => this.nodes.get(id)!);
        allPaths.push({
          nodes,
          distance: path.length - 1,
          strength: 1 / (path.length - 1)
        });
        return;
      }

      visited.add(currentId);

      const neighbors = this.adjacencyList.get(currentId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, neighbor], depth + 1);
        }
      }

      visited.delete(currentId);
    };

    dfs(startId, [startId], 0);

    // Sort by distance (shortest first)
    return allPaths.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate distance between two nodes (shortest path length)
   */
  calculateDistance(nodeA: string, nodeB: string): number {
    const path = this.findShortestPath(nodeA, nodeB);
    return path ? path.distance : Infinity;
  }

  /**
   * Calculate betweenness centrality for all nodes
   * Identifies "bridge" concepts that connect different parts
   */
  calculateBetweennessCentrality(): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodes = Array.from(this.nodes.keys());

    // Initialize
    nodes.forEach(node => centrality.set(node, 0));

    // For each pair of nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const paths = this.findAllPaths(nodes[i], nodes[j], 8);

        if (paths.length === 0) continue;

        // Find shortest path length
        const shortestLength = Math.min(...paths.map(p => p.distance));
        const shortestPaths = paths.filter(p => p.distance === shortestLength);

        // Count how many shortest paths pass through each node
        const pathCounts = new Map<string, number>();
        shortestPaths.forEach(path => {
          path.nodes.forEach((node, idx) => {
            // Don't count start and end nodes
            if (idx > 0 && idx < path.nodes.length - 1) {
              pathCounts.set(node.id, (pathCounts.get(node.id) || 0) + 1);
            }
          });
        });

        // Add to centrality scores
        pathCounts.forEach((count, nodeId) => {
          centrality.set(nodeId, centrality.get(nodeId)! + count / shortestPaths.length);
        });
      }
    }

    return centrality;
  }

  /**
   * Calculate degree centrality (number of connections)
   */
  calculateDegreeCentrality(): Map<string, number> {
    const centrality = new Map<string, number>();

    this.adjacencyList.forEach((neighbors, nodeId) => {
      centrality.set(nodeId, neighbors.size);
    });

    return centrality;
  }

  /**
   * Find clusters/communities using simple label propagation
   */
  findClusters(): Map<string, number> {
    const labels = new Map<string, number>();
    const nodes = Array.from(this.nodes.keys());

    // Initialize each node with unique label
    nodes.forEach((node, idx) => labels.set(node, idx));

    // Iterate until convergence
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // Shuffle nodes for random order
      const shuffled = [...nodes].sort(() => Math.random() - 0.5);

      for (const node of shuffled) {
        const neighbors = this.adjacencyList.get(node);
        if (!neighbors || neighbors.size === 0) continue;

        // Count neighbor labels
        const labelCounts = new Map<number, number>();
        neighbors.forEach(neighbor => {
          const label = labels.get(neighbor)!;
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        });

        // Find most common label
        let maxCount = 0;
        let mostCommonLabel = labels.get(node)!;
        labelCounts.forEach((count, label) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommonLabel = label;
          }
        });

        // Update label if changed
        if (labels.get(node) !== mostCommonLabel) {
          labels.set(node, mostCommonLabel);
          changed = true;
        }
      }
    }

    return labels;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node by ID
   */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: string): GraphNode[] {
    const neighbors = this.adjacencyList.get(nodeId);
    if (!neighbors) return [];

    return Array.from(neighbors)
      .map(id => this.nodes.get(id))
      .filter((node): node is GraphNode => node !== undefined);
  }
}
