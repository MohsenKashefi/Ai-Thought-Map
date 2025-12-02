import { useState, useEffect } from 'react';
import type { MindMap } from '../../types/mindmap';
import { MindMapGraph, type Path, type GraphNode } from '../../services/graph';

interface PathExplorerProps {
  mindMap: MindMap;
  selectedConcept?: string | null;
}

export const PathExplorer: React.FC<PathExplorerProps> = ({ mindMap, selectedConcept }) => {
  const [graph, setGraph] = useState<MindMapGraph | null>(null);
  const [allConcepts, setAllConcepts] = useState<string[]>([]);
  const [concept1, setConcept1] = useState<string>('');
  const [concept2, setConcept2] = useState<string>('');
  const [showAllPaths, setShowAllPaths] = useState(false);
  const [shortestPath, setShortestPath] = useState<Path | null>(null);
  const [allPaths, setAllPaths] = useState<Path[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [isExploring, setIsExploring] = useState(false);

  useEffect(() => {
    const g = new MindMapGraph(mindMap);
    setGraph(g);

    // Get all concepts for dropdown
    const concepts = [
      mindMap.centralIdea,
      ...mindMap.branches.flatMap(b => [b.title, ...b.subBranches])
    ];
    setAllConcepts(concepts);

    // Set initial selections if provided
    if (selectedConcept && concepts.includes(selectedConcept)) {
      setConcept1(selectedConcept);
    }
  }, [mindMap, selectedConcept]);

  const findPaths = () => {
    if (!graph || !concept1 || !concept2) return;
    if (concept1 === concept2) {
      alert('Please select two different concepts');
      return;
    }

    setIsExploring(true);

    try {
      // Find the node IDs for the selected concepts
      const node1 = findNodeIdByConcept(concept1);
      const node2 = findNodeIdByConcept(concept2);

      if (!node1 || !node2) {
        alert('Could not find one or both concepts');
        setIsExploring(false);
        return;
      }

      // Calculate distance
      const dist = graph.calculateDistance(node1, node2);
      setDistance(dist);

      // Find shortest path
      const shortest = graph.findShortestPath(node1, node2);
      setShortestPath(shortest);

      // Find all paths if requested
      if (showAllPaths) {
        const paths = graph.findAllPaths(node1, node2, 8);
        setAllPaths(paths);
      } else {
        setAllPaths([]);
      }
    } catch (error) {
      console.error('Error finding paths:', error);
      alert('Error finding paths between concepts');
    } finally {
      setIsExploring(false);
    }
  };

  const findNodeIdByConcept = (concept: string): string | null => {
    if (!graph) return null;

    const nodes = graph.getAllNodes();
    const node = nodes.find(n => n.label === concept);
    return node ? node.id : null;
  };

  const clearSearch = () => {
    setConcept1('');
    setConcept2('');
    setShortestPath(null);
    setAllPaths([]);
    setDistance(null);
  };

  const renderPath = (path: Path, index?: number) => (
    <div key={index} className="path-visualization">
      {index !== undefined && (
        <div className="path-header">
          <span className="path-number">Path {index + 1}</span>
          <span className="path-distance">Distance: {path.distance}</span>
          <span className="path-strength">Strength: {Math.round(path.strength * 100)}%</span>
        </div>
      )}

      <div className="path-nodes">
        {path.nodes.map((node, idx) => (
          <div key={idx} className="path-step">
            <div className={`path-node ${node.type}`}>
              <span className="node-label">{node.label}</span>
              <span className="node-type">{node.type}</span>
            </div>
            {idx < path.nodes.length - 1 && (
              <div className="path-arrow">↓</div>
            )}
          </div>
        ))}
      </div>

      {index === undefined && path.distance > 0 && (
        <div className="path-analysis">
          <p>
            <strong>Connection Strength:</strong>{' '}
            {path.strength > 0.5 ? 'Strong 💪' :
             path.strength > 0.25 ? 'Moderate ✋' :
             'Weak 🤏'}
          </p>
          <p>
            <strong>Logical Path:</strong>{' '}
            {path.nodes.map(n => n.label).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );

  const getDistanceDescription = (dist: number): string => {
    if (dist === 0) return 'Same concept';
    if (dist === 1) return 'Directly connected';
    if (dist === 2) return 'One step apart';
    if (dist === 3) return 'Two steps apart';
    return `${dist - 1} steps apart`;
  };

  return (
    <div className="path-explorer">
      <div className="explorer-header">
        <h3>🔍 Path Explorer</h3>
        <p className="explorer-description">
          Explore logical connections between any two concepts
        </p>
      </div>

      <div className="explorer-controls">
        <div className="concept-selector">
          <div className="selector-group">
            <label>From Concept:</label>
            <select
              value={concept1}
              onChange={(e) => setConcept1(e.target.value)}
              className="concept-dropdown"
            >
              <option value="">Select first concept...</option>
              {allConcepts.map((concept, idx) => (
                <option key={idx} value={concept}>
                  {concept}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-arrow">→</div>

          <div className="selector-group">
            <label>To Concept:</label>
            <select
              value={concept2}
              onChange={(e) => setConcept2(e.target.value)}
              className="concept-dropdown"
            >
              <option value="">Select second concept...</option>
              {allConcepts.map((concept, idx) => (
                <option key={idx} value={concept}>
                  {concept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="explorer-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showAllPaths}
              onChange={(e) => setShowAllPaths(e.target.checked)}
            />
            <span>Show all possible paths</span>
          </label>
        </div>

        <div className="explorer-actions">
          <button
            className="btn-primary"
            onClick={findPaths}
            disabled={!concept1 || !concept2 || isExploring}
          >
            {isExploring ? '🔍 Exploring...' : '🔍 Find Paths'}
          </button>
          <button
            className="btn-secondary"
            onClick={clearSearch}
            disabled={!shortestPath && !allPaths.length}
          >
            Clear
          </button>
        </div>
      </div>

      {distance !== null && (
        <div className="explorer-results">
          <div className="distance-summary">
            <h4>Connection Summary</h4>
            <div className="distance-card">
              <div className="distance-value">{distance}</div>
              <div className="distance-label">
                {getDistanceDescription(distance)}
              </div>
            </div>
            <p className="distance-explanation">
              {distance === Infinity
                ? '⚠️ These concepts are not connected in your mind map'
                : distance <= 2
                ? '✅ Very closely related concepts'
                : distance <= 4
                ? 'ℹ️ Moderately connected concepts'
                : '📊 Distantly related concepts'}
            </p>
          </div>

          {shortestPath && (
            <div className="shortest-path-section">
              <h4>Shortest Path</h4>
              {renderPath(shortestPath)}
            </div>
          )}

          {showAllPaths && allPaths.length > 1 && (
            <div className="all-paths-section">
              <h4>All Paths ({allPaths.length})</h4>
              <p className="section-note">
                Multiple ways to connect these concepts
              </p>
              <div className="paths-list">
                {allPaths.map((path, idx) => renderPath(path, idx))}
              </div>
            </div>
          )}

          {showAllPaths && allPaths.length <= 1 && shortestPath && (
            <div className="single-path-note">
              <p>ℹ️ Only one path exists between these concepts</p>
            </div>
          )}
        </div>
      )}

      {!distance && (
        <div className="explorer-placeholder">
          <div className="placeholder-icon">🗺️</div>
          <p>Select two concepts to explore their connection</p>
          <div className="placeholder-hints">
            <strong>What you'll discover:</strong>
            <ul>
              <li>📏 Distance between concepts</li>
              <li>🛤️ Shortest logical path</li>
              <li>🔀 All possible connections</li>
              <li>💪 Connection strength</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
