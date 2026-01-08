export default function ContactLookup({ part }) {
  const output = part.output;

  if (part.state !== 'output-available' || !output) {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#e8eaf6',
        borderRadius: 8,
        border: '1px solid #7986cb',
        fontSize: 14
      }}>
        <div style={{ color: '#3949ab' }}>Looking up contact...</div>
      </div>
    );
  }

  if (!output.found) {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#ffebee',
        borderRadius: 8,
        border: '1px solid #ef5350',
        fontSize: 14
      }}>
        <div style={{ color: '#c62828' }}>
          Contact "{output.name}" not found
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: '8px 0',
      padding: 12,
      background: '#e8eaf6',
      borderRadius: 8,
      border: '1px solid #7986cb',
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8, color: '#3949ab' }}>
        Contact Info
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        <div>
          <span style={{ color: '#666', marginRight: 8 }}>Name:</span>
          <span style={{ fontWeight: 500 }}>{output.name}</span>
        </div>
        <div>
          <span style={{ color: '#666', marginRight: 8 }}>Email:</span>
          <a href={`mailto:${output.email}`} style={{ color: '#1976d2' }}>
            {output.email}
          </a>
        </div>
        <div>
          <span style={{ color: '#666', marginRight: 8 }}>Timezone:</span>
          <span>{output.timezone}</span>
        </div>
        {output.phone && (
          <div>
            <span style={{ color: '#666', marginRight: 8 }}>Phone:</span>
            <span>{output.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
