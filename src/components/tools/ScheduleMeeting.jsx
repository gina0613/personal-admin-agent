'use client';

import { useState } from 'react';

export default function ScheduleMeeting({ part }) {
  const [status, setStatus] = useState('pending'); // pending, confirming, confirmed, cancelled
  const [savedEvent, setSavedEvent] = useState(null);

  const output = part.output;

  const handleConfirm = async () => {
    if (!output?.event) return;

    setStatus('confirming');

    try {
      const res = await fetch('/api/calendar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: output.event.title,
          start: output.event.start,
          end: output.event.end,
          attendees: output.event.attendees,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSavedEvent(data.event);
        setStatus('confirmed');
      } else {
        setStatus('pending');
        alert('Failed to create event: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setStatus('pending');
      alert('Failed to create event: ' + err.message);
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (part.state !== 'output-available' || !output) {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#e3f2fd',
        borderRadius: 8,
        border: '1px solid #2196f3',
        fontSize: 14
      }}>
        <div style={{ color: '#1565c0' }}>Scheduling meeting...</div>
      </div>
    );
  }

  // Error state
  if (output.error) {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#ffebee',
        borderRadius: 8,
        border: '1px solid #ef5350',
        fontSize: 14
      }}>
        <div style={{ color: '#c62828' }}>{output.message}</div>
      </div>
    );
  }

  // Cancelled state
  if (status === 'cancelled') {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#ffebee',
        borderRadius: 8,
        border: '1px solid #ef5350',
        fontSize: 14
      }}>
        <div style={{ color: '#c62828' }}>Meeting scheduling cancelled</div>
      </div>
    );
  }

  // Confirmed state
  if (status === 'confirmed' && savedEvent) {
    return (
      <div style={{ margin: '8px 0' }}>
        <div style={{
          padding: 12,
          background: '#e8f5e9',
          borderRadius: 8,
          border: '1px solid #4caf50',
          fontSize: 14
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: '#2e7d32' }}>
            Meeting Scheduled!
          </div>
          <div style={{ fontWeight: 600 }}>{savedEvent.title}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            {formatDateTime(savedEvent.start)} - {formatDateTime(savedEvent.end).split(', ').pop()}
          </div>
        </div>
        {output.emailDraft && (
          <div style={{
            marginTop: 8,
            padding: 12,
            background: '#e3f2fd',
            borderRadius: 8,
            border: '1px solid #2196f3',
            fontSize: 14
          }}>
            <div style={{ fontWeight: 500, marginBottom: 8, color: '#1565c0' }}>
              Email Ready to Send
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>To: {output.emailDraft.to}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{output.emailDraft.subject}</div>
          </div>
        )}
      </div>
    );
  }

  // Pending confirmation state
  return (
    <div style={{ margin: '8px 0' }}>
      {/* Free Slots */}
      {output.freeSlots && output.freeSlots.length > 0 && (
        <div style={{
          padding: 12,
          background: '#e8eaf6',
          borderRadius: 8,
          border: '1px solid #7986cb',
          fontSize: 14,
          marginBottom: 8
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: '#3949ab' }}>
            Available Time Slots
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {output.freeSlots.map((slot, i) => (
              <span key={i} style={{
                padding: '4px 8px',
                background: '#fff',
                borderRadius: 4,
                fontSize: 12
              }}>
                {slot.start} - {slot.end}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event Preview */}
      <div style={{
        padding: 12,
        background: '#fff3e0',
        borderRadius: 8,
        border: '1px solid #ff9800',
        fontSize: 14,
        marginBottom: 8
      }}>
        <div style={{ fontWeight: 500, marginBottom: 8, color: '#e65100' }}>
          Confirm Meeting
        </div>
        <div style={{ fontWeight: 600 }}>{output.event?.title}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
          {output.event && formatDateTime(output.event.start)} - {output.event && formatDateTime(output.event.end).split(', ').pop()}
        </div>
        {output.contact && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            With: {output.contact.name} ({output.contact.email})
          </div>
        )}
      </div>

      {/* Email Draft Preview */}
      {output.emailDraft && (
        <div style={{
          padding: 12,
          background: '#f3e5f5',
          borderRadius: 8,
          border: '1px solid #ab47bc',
          fontSize: 14,
          marginBottom: 8
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: '#7b1fa2' }}>
            Email Draft
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>To: {output.emailDraft.to}</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{output.emailDraft.subject}</div>
          <div style={{
            marginTop: 8,
            padding: 8,
            background: '#fff',
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
            fontSize: 13
          }}>
            {output.emailDraft.body}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleConfirm}
          disabled={status === 'confirming'}
          style={{
            padding: '8px 20px',
            background: status === 'confirming' ? '#ccc' : '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'confirming' ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {status === 'confirming' ? 'Saving...' : 'Confirm & Create'}
        </button>
        <button
          onClick={handleCancel}
          disabled={status === 'confirming'}
          style={{
            padding: '8px 20px',
            background: '#fff',
            color: '#666',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: status === 'confirming' ? 'not-allowed' : 'pointer',
            fontSize: 14,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
