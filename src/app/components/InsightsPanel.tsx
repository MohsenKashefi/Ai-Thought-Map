import { useState, useEffect } from 'react';
import type { MindMap } from '../../types/mindmap';
import { MindMapGraph } from '../../services/graph';
import { ConsistencyChecker, type ConsistencyIssue } from '../../services/consistency';
import { SemanticAnalyzer, type ConceptCluster, type SuggestedConnection } from '../../services/semantic';

interface InsightsPanelProps {
  mindMap: MindMap;
  onConceptSelect?: (concept: string) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ mindMap, onConceptSelect }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'connections' | 'clusters'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(false);

  // Analysis results
  const [consistencyScore, setConsistencyScore] = useState<number>(0);
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [centralConcepts, setCentralConcepts] = useState<Array<{concept: string, score: number}>>([]);
  const [clusters, setClusters] = useState<ConceptCluster[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    analyzeMap();
  }, [mindMap]);

  const analyzeMap = async () => {
    setIsAnalyzing(true);

    try {
      // Create graph and analyzers
      const graph = new MindMapGraph(mindMap);
      const consistencyChecker = new ConsistencyChecker(mindMap);
      const semanticAnalyzer = new SemanticAnalyzer(mindMap);

      // Run consistency check
      const consistencyReport = consistencyChecker.check();
      setConsistencyScore(consistencyReport.score);
      setIssues(consistencyReport.issues);
      setStatistics(consistencyReport.statistics);

      // Calculate centrality
      const betweenness = graph.calculateBetweennessCentrality();
      const degree = graph.calculateDegreeCentrality();

      const centralityScores = Array.from(betweenness.entries())
        .map(([nodeId, score]) => {
          const node = graph.getNode(nodeId);
          return node ? {
            concept: node.label,
            score: score + (degree.get(nodeId) || 0)
          } : null;
        })
        .filter((item): item is {concept: string, score: number} => item !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setCentralConcepts(centralityScores);

      // Run semantic analysis
      const semanticResults = await semanticAnalyzer.analyze(useAI);
      setClusters(semanticResults.clusters.slice(0, 5));
      setSuggestions(semanticResults.suggestedConnections.slice(0, 10));

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
    }
  };

  const renderOverview = () => (
    <div className="insights-overview">
      <div className="score-card">
        <h3>Quality Score</h3>
        <div className="score-circle" style={{ '--score-color': getScoreColor(consistencyScore) } as any}>
          <span className="score-value">{Math.round(consistencyScore)}</span>
          <span className="score-label">/100</span>
        </div>
        <p className="score-description">
          {consistencyScore >= 80 && 'Excellent mind map structure!'}
          {consistencyScore >= 60 && consistencyScore < 80 && 'Good structure with room for improvement'}
          {consistencyScore < 60 && 'Consider addressing the issues below'}
        </p>
      </div>

      {statistics && (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{statistics.totalNodes}</span>
            <span className="stat-label">Total Concepts</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{statistics.branchCount}</span>
            <span className="stat-label">Main Branches</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{statistics.avgBranchDepth.toFixed(1)}</span>
            <span className="stat-label">Avg Branch Depth</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.round(statistics.balanceScore * 100)}%</span>
            <span className="stat-label">Balance</span>
          </div>
        </div>
      )}

      <div className="quick-insights">
        <h4>Key Insights</h4>
        <ul>
          <li>🎯 {centralConcepts.length > 0 ? `"${centralConcepts[0].concept}" is your most central concept` : 'Analyzing central concepts...'}</li>
          <li>🔗 {suggestions.length} potential connections identified</li>
          <li>🏷️ {clusters.length} thematic clusters found</li>
          <li>⚠️ {issues.length} {issues.length === 1 ? 'issue' : 'issues'} detected</li>
        </ul>
      </div>
    </div>
  );

  const renderQuality = () => (
    <div className="quality-tab">
      <div className="issues-section">
        <h4>Issues & Suggestions ({issues.length})</h4>

        {issues.length === 0 ? (
          <div className="no-issues">
            <span className="success-icon">✅</span>
            <p>No issues detected! Your mind map structure looks great.</p>
          </div>
        ) : (
          <div className="issues-list">
            {issues.map((issue, idx) => (
              <div key={idx} className="issue-item" style={{ borderLeftColor: getSeverityColor(issue.severity) }}>
                <div className="issue-header">
                  <span className="severity-badge" style={{ backgroundColor: getSeverityColor(issue.severity) }}>
                    {getSeverityIcon(issue.severity)} {issue.severity}
                  </span>
                  <span className="issue-type">{issue.type}</span>
                </div>

                <div className="issue-content">
                  {issue.type === 'contradiction' && (
                    <>
                      <p><strong>Contradiction detected:</strong></p>
                      <p className="concept-highlight">"{issue.concept1}" ↔️ "{issue.concept2}"</p>
                      <p className="issue-reason">{issue.reason}</p>
                      {issue.suggestion && <p className="suggestion">💡 {issue.suggestion}</p>}
                    </>
                  )}

                  {issue.type === 'redundancy' && (
                    <>
                      <p><strong>Similar concepts found:</strong></p>
                      <p className="concept-highlight">{issue.concepts.join(' & ')}</p>
                      <p className="issue-reason">Similarity: {Math.round(issue.similarity * 100)}%</p>
                      <p className="suggestion">💡 {issue.suggestion}</p>
                    </>
                  )}

                  {issue.type === 'hierarchy' && (
                    <>
                      <p><strong>Hierarchy issue:</strong></p>
                      <p className="concept-highlight">"{issue.parent}" → "{issue.child}"</p>
                      <p className="issue-reason">{issue.reason}</p>
                      {issue.suggestion && <p className="suggestion">💡 {issue.suggestion}</p>}
                    </>
                  )}

                  {issue.type === 'gap' && (
                    <>
                      <p><strong>Branch: "{issue.branch}"</strong></p>
                      <p className="issue-reason">{issue.reason}</p>
                      <div className="suggestions-list">
                        <p><strong>Suggestions:</strong></p>
                        <ul>
                          {issue.suggestions.map((sug, i) => (
                            <li key={i}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="central-concepts">
        <h4>Most Important Concepts</h4>
        <p className="section-description">
          These concepts connect different parts of your mind map
        </p>
        <div className="concepts-ranking">
          {centralConcepts.map((item, idx) => (
            <div
              key={idx}
              className="concept-rank-item"
              onClick={() => onConceptSelect?.(item.concept)}
            >
              <span className="rank-number">#{idx + 1}</span>
              <span className="rank-concept">{item.concept}</span>
              <div className="rank-bar">
                <div
                  className="rank-fill"
                  style={{ width: `${(item.score / centralConcepts[0].score) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConnections = () => (
    <div className="connections-tab">
      <div className="ai-toggle">
        <label>
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => {
              setUseAI(e.target.checked);
              if (e.target.checked) {
                analyzeMap();
              }
            }}
          />
          <span>Use AI for semantic analysis (better accuracy)</span>
        </label>
      </div>

      <h4>Suggested Connections ({suggestions.length})</h4>
      <p className="section-description">
        Related concepts that could be linked together
      </p>

      {suggestions.length === 0 ? (
        <p className="no-data">No cross-branch connections suggested</p>
      ) : (
        <div className="suggestions-list">
          {suggestions.map((sug, idx) => (
            <div key={idx} className="suggestion-item">
              <div className="connection-visual">
                <span className="from-concept" onClick={() => onConceptSelect?.(sug.from)}>
                  {sug.from}
                </span>
                <span className="connection-arrow">
                  <span className="confidence-badge">{Math.round(sug.confidence * 100)}%</span>
                  ↔️
                </span>
                <span className="to-concept" onClick={() => onConceptSelect?.(sug.to)}>
                  {sug.to}
                </span>
              </div>
              <p className="suggestion-reason">{sug.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClusters = () => (
    <div className="clusters-tab">
      <h4>Thematic Clusters ({clusters.length})</h4>
      <p className="section-description">
        Groups of related concepts in your mind map
      </p>

      {clusters.length === 0 ? (
        <p className="no-data">No distinct clusters identified</p>
      ) : (
        <div className="clusters-list">
          {clusters.map((cluster, idx) => (
            <div key={idx} className="cluster-item">
              <div className="cluster-header">
                <h5>
                  <span className="cluster-icon">🏷️</span>
                  {cluster.theme}
                </h5>
                <span className="coherence-badge">
                  {Math.round(cluster.coherence * 100)}% coherent
                </span>
              </div>
              <div className="cluster-concepts">
                {cluster.concepts.map((concept, i) => (
                  <span
                    key={i}
                    className="cluster-concept-tag"
                    onClick={() => onConceptSelect?.(concept)}
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <h2>🧠 Mind Map Insights</h2>
        <button
          className="refresh-btn"
          onClick={analyzeMap}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '⏳ Analyzing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className="insights-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          Quality {issues.length > 0 && <span className="badge">{issues.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          Connections {suggestions.length > 0 && <span className="badge">{suggestions.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'clusters' ? 'active' : ''}`}
          onClick={() => setActiveTab('clusters')}
        >
          Clusters {clusters.length > 0 && <span className="badge">{clusters.length}</span>}
        </button>
      </div>

      <div className="insights-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'quality' && renderQuality()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'clusters' && renderClusters()}
      </div>
    </div>
  );
};
