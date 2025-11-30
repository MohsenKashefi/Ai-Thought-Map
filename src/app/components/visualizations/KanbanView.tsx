import type { MindMap } from "../../../types/mindmap";

interface KanbanViewProps {
  mindMap: MindMap;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ mindMap }) => {
  return (
    <div style={{
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px'
    }}>
      {/* Central Idea Header */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          {mindMap.centralIdea}
        </h2>
      </div>

      {/* Kanban columns */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {mindMap.branches.map((branch, index) => (
          <div
            key={index}
            style={{
              minWidth: '280px',
              maxWidth: '280px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Column header */}
            <div style={{
              padding: '16px',
              borderBottom: '2px solid #667eea',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
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
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                    {index + 1}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#334155',
                  margin: 0,
                  flex: 1
                }}>
                  {branch.title}
                </h3>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {branch.subBranches.length} {branch.subBranches.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {/* Cards */}
            <div style={{
              padding: '12px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto'
            }}>
              {branch.subBranches.map((subBranch, subIndex) => (
                <div
                  key={subIndex}
                  style={{
                    padding: '12px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    color: '#334155',
                    lineHeight: '1.5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#764ba2',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <span>{subBranch}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollbar styling */}
      <style>{`
        div::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};
