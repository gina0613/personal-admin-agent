export default function FreeSlots({ part }) {
  return (
    <div style={{
      margin: '8px 0',
      padding: 12,
      background: '#f5f5f5',
      borderRadius: 8,
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8 }}>
        📅 Calendar Free Slots
      </div>
      {part.state === 'output-available' && part.output?.freeSlots && (
        <div>
          {part.output.freeSlots.map((slot, j) => (
            <div key={j} style={{ padding: '4px 0' }}>
              ✅ {slot.start} - {slot.end} ({slot.durationMinutes} min)
            </div>
          ))}
        </div>
      )}
      {part.state !== 'output-available' && (
        <div>⏳ Finding slots...</div>
      )}
    </div>
  );
}
