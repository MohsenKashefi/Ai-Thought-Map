import { useRef, useState } from "react";
import type { MindMap } from "../../types/mindmap";
import { MindMapExporter } from "../../services/export";

interface MindMapVisualizationProps {
  mindMap: MindMap;
}

export const MindMapVisualization: React.FC<MindMapVisualizationProps> = ({
  mindMap,
}) => {
  const mindmapRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    if (!mindmapRef.current) return;
    setIsExporting(true);
    try {
      const filename = MindMapExporter.generateFilename(mindMap.centralIdea);
      await MindMapExporter.exportAsPNG(mindmapRef.current, filename);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to export as PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!mindmapRef.current) return;
    setIsExporting(true);
    try {
      const filename = MindMapExporter.generateFilename(mindMap.centralIdea);
      await MindMapExporter.exportAsPDF(mindmapRef.current, filename);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to export as PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!mindmapRef.current) return;
    setIsExporting(true);
    try {
      await MindMapExporter.copyToClipboard(mindmapRef.current);
      alert("Mind map copied to clipboard!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to copy to clipboard."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: '#475569',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.5 : 1
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PNG
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: '#475569',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.5 : 1
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>

        <button
          onClick={handleCopyToClipboard}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: '#475569',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.5 : 1
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>

        {isExporting && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#667eea' }}>
            <svg style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Exporting...
          </span>
        )}
      </div>

      {/* Mind Map Content */}
      <div ref={mindmapRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Central Idea */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{mindMap.centralIdea}</h2>
        </div>

        {/* Branches Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {mindMap.branches.map((branch, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Branch Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '12px',
                marginBottom: '12px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>{index + 1}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#334155', margin: 0 }}>
                  {branch.title}
                </h3>
              </div>

              {/* Sub-branches */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {branch.subBranches.map((subBranch, subIndex) => (
                  <li key={subIndex} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                    <span style={{ color: '#764ba2', fontWeight: 'bold', flexShrink: 0 }}>→</span>
                    <span>{subBranch}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
