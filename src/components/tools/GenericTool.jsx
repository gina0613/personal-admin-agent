export default function GenericTool({ part, toolName }) {
  return (
    <div style={{
      margin: '8px 0',
      padding: 12,
      background: '#f5f5f5',
      borderRadius: 8,
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8 }}>
        🔧 {toolName}
      </div>
      {part.state === 'output-available' && (
        <pre style={{ fontSize: 12 }}>{JSON.stringify(part.output, null, 2)}</pre>
      )}
      {part.state !== 'output-available' && (
        <div>⏳ Processing...</div>
      )}
    </div>
  );
}
