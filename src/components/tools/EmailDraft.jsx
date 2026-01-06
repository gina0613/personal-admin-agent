export default function EmailDraft({ part }) {
  return (
    <div style={{
      margin: '8px 0',
      padding: 16,
      background: '#f8f9fa',
      borderRadius: 8,
      border: '1px solid #e9ecef',
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 12, color: '#495057' }}>
        ✉️ Email Draft
      </div>
      {part.state === 'output-available' && part.output && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#6c757d' }}>To: </span>
            <span>{part.output.to}</span>
          </div>
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#fff', borderRadius: 4 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {part.output.subject}
            </div>
          </div>
          <div style={{ padding: '12px', background: '#fff', borderRadius: 4, lineHeight: 1.6 }}>
            {part.output.body}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#6c757d' }}>
            Tone: {part.output.tone || 'formal'}
          </div>
        </div>
      )}
      {part.state !== 'output-available' && (
        <div>⏳ Drafting email...</div>
      )}
    </div>
  );
}
