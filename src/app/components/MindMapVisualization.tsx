"use client";

import { useRef, useState } from "react";
import type { MindMap, VisualizationStyle } from "../../types/mindmap";
import { MindMapExporter } from "../../services/export";
import { GridView } from "./visualizations/GridView";
import { TreeView } from "./visualizations/TreeView";
import { RadialView } from "./visualizations/RadialView";
import { TimelineView } from "./visualizations/TimelineView";
import { KanbanView } from "./visualizations/KanbanView";

interface MindMapVisualizationProps {
  mindMap: MindMap;
}

export const MindMapVisualization: React.FC<MindMapVisualizationProps> = ({
  mindMap,
}) => {
  const mindmapRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [visualizationStyle, setVisualizationStyle] = useState<VisualizationStyle>('grid');

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

  const renderVisualization = () => {
    switch (visualizationStyle) {
      case 'grid':
        return <GridView mindMap={mindMap} />;
      case 'tree':
        return <TreeView mindMap={mindMap} />;
      case 'radial':
        return <RadialView mindMap={mindMap} />;
      case 'timeline':
        return <TimelineView mindMap={mindMap} />;
      case 'kanban':
        return <KanbanView mindMap={mindMap} />;
      default:
        return <GridView mindMap={mindMap} />;
    }
  };

  const visualizationOptions: { value: VisualizationStyle; label: string; icon: string }[] = [
    { value: 'grid', label: 'Grid', icon: '⊞' },
    { value: 'tree', label: 'Tree', icon: '⊶' },
    { value: 'radial', label: 'Radial', icon: '◉' },
    { value: 'timeline', label: 'Timeline', icon: '⊣' },
    { value: 'kanban', label: 'Kanban', icon: '▦' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Visualization Style Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'white',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
        }}>
          {visualizationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setVisualizationStyle(option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                background: visualizationStyle === option.value
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: visualizationStyle === option.value ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: visualizationStyle === option.value ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (visualizationStyle !== option.value) {
                  e.currentTarget.style.background = '#f1f5f9';
                }
              }}
              onMouseLeave={(e) => {
                if (visualizationStyle !== option.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
      </div>

      {/* Mind Map Content */}
      <div ref={mindmapRef}>
        {renderVisualization()}
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
