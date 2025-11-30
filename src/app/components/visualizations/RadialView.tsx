import type { MindMap } from "../../../types/mindmap";

interface RadialViewProps {
  mindMap: MindMap;
}

export const RadialView: React.FC<RadialViewProps> = ({ mindMap }) => {
  const totalBranches = mindMap.branches.length;
  const angleStep = (2 * Math.PI) / totalBranches;
  const centerRadius = 120;
  const branchDistance = 200;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '600px',
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '40px',
      overflow: 'auto'
    }}>
      <div style={{
        position: 'relative',
        width: '800px',
        height: '800px',
        margin: '0 auto'
      }}>
        {/* SVG for connection lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {mindMap.branches.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x1 = 400;
            const y1 = 400;
            const x2 = 400 + Math.cos(angle) * branchDistance;
            const y2 = 400 + Math.sin(angle) * branchDistance;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#667eea"
                strokeWidth="2"
                opacity="0.3"
              />
            );
          })}
        </svg>

        {/* Central idea */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${centerRadius * 2}px`,
          height: `${centerRadius * 2}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          zIndex: 10
        }}>
          {mindMap.centralIdea}
        </div>

        {/* Branches positioned radially */}
        {mindMap.branches.map((branch, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = 400 + Math.cos(angle) * branchDistance;
          const y = 400 + Math.sin(angle) * branchDistance;

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                width: '180px'
              }}
            >
              {/* Branch title */}
              <div style={{
                background: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                fontSize: '14px',
                fontWeight: '600',
                color: '#334155',
                textAlign: 'center',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                {branch.title}
              </div>

              {/* Sub-branches */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {branch.subBranches.map((subBranch, subIndex) => (
                  <div
                    key={subIndex}
                    style={{
                      background: 'white',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      color: '#475569',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <span style={{ color: '#764ba2', marginRight: '4px' }}>→</span>
                    {subBranch}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
