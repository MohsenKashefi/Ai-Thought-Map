import type { MindMap } from "../../../types/mindmap";

interface GridViewProps {
  mindMap: MindMap;
}

export const GridView: React.FC<GridViewProps> = ({ mindMap }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
  );
};
