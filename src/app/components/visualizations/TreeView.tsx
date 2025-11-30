import type { MindMap } from "../../../types/mindmap";

interface TreeViewProps {
  mindMap: MindMap;
}

export const TreeView: React.FC<TreeViewProps> = ({ mindMap }) => {
  return (
    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
      {/* Central Node */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          padding: '16px 32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '24px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          textAlign: 'center'
        }}>
          {mindMap.centralIdea}
        </div>

        {/* Branches */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '800px'
        }}>
          {mindMap.branches.map((branch, index) => (
            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Branch connector */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '12px'
              }}>
                <div style={{
                  width: '3px',
                  height: '20px',
                  background: '#cbd5e1'
                }} />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }} />
                <div style={{
                  width: '3px',
                  flex: 1,
                  minHeight: '20px',
                  background: '#cbd5e1'
                }} />
              </div>

              {/* Branch content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: '2px solid #667eea',
                  fontWeight: '600',
                  color: '#334155'
                }}>
                  {branch.title}
                </div>

                {/* Sub-branches */}
                <div style={{
                  paddingLeft: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {branch.subBranches.map((subBranch, subIndex) => (
                    <div
                      key={subIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        color: '#475569'
                      }}
                    >
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#764ba2',
                        flexShrink: 0
                      }} />
                      {subBranch}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
