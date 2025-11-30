import type { MindMap } from "../../../types/mindmap";

interface TimelineViewProps {
  mindMap: MindMap;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ mindMap }) => {
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
        marginBottom: '40px',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          {mindMap.centralIdea}
        </h2>
      </div>

      {/* Timeline */}
      <div style={{
        position: 'relative',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '3px',
          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
          transform: 'translateX(-50%)'
        }} />

        {/* Timeline items */}
        {mindMap.branches.map((branch, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div
              key={index}
              style={{
                position: 'relative',
                marginBottom: '40px',
                display: 'flex',
                justifyContent: isLeft ? 'flex-start' : 'flex-end'
              }}
            >
              {/* Timeline marker */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '20px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '4px solid #f8fafc',
                transform: 'translateX(-50%)',
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'white'
                }} />
              </div>

              {/* Content card */}
              <div style={{
                width: 'calc(50% - 40px)',
                marginLeft: isLeft ? 0 : 'auto',
                marginRight: isLeft ? 'auto' : 0
              }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  position: 'relative'
                }}>
                  {/* Arrow pointing to timeline */}
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    [isLeft ? 'right' : 'left']: '-8px',
                    width: 0,
                    height: 0,
                    borderTop: '8px solid transparent',
                    borderBottom: '8px solid transparent',
                    [isLeft ? 'borderRight' : 'borderLeft']: '8px solid white'
                  }} />

                  {/* Step number */}
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '12px'
                  }}>
                    Step {index + 1}
                  </div>

                  {/* Branch title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '12px',
                    marginTop: 0
                  }}>
                    {branch.title}
                  </h3>

                  {/* Sub-branches */}
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {branch.subBranches.map((subBranch, subIndex) => (
                      <li
                        key={subIndex}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '14px',
                          color: '#475569',
                          alignItems: 'flex-start'
                        }}
                      >
                        <span style={{
                          color: '#764ba2',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          •
                        </span>
                        <span>{subBranch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
