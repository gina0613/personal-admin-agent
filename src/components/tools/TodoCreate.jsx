export default function TodoCreate({ part }) {
  const priorityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#dc3545',
  };

  return (
    <div style={{
      margin: '8px 0',
      padding: 12,
      background: '#fff3cd',
      borderRadius: 8,
      border: '1px solid #ffc107',
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8, color: '#856404' }}>
        ✅ Todo Created
      </div>
      {part.state === 'output-available' && part.output && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: priorityColors[part.output.priority] || priorityColors.medium,
              color: '#fff',
              fontSize: 12,
              textTransform: 'uppercase'
            }}>
              {part.output.priority || 'medium'}
            </span>
            {part.output.dueDate && (
              <span style={{ fontSize: 12, color: '#666' }}>
                Due: {part.output.dueDate}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 500 }}>
            {part.output.title}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            ID: {part.output.id}
          </div>
        </div>
      )}
      {part.state !== 'output-available' && (
        <div>⏳ Creating todo...</div>
      )}
    </div>
  );
}
