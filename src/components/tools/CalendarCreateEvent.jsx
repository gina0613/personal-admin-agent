'use client';

import { useState } from 'react';

export default function CalendarCreateEvent({ part }) {
  const [status, setStatus] = useState('pending'); // pending, confirming, confirmed, cancelled
  const [savedEvent, setSavedEvent] = useState(null);

  const output = part.output;
  const event = output?.event;

  const handleConfirm = async () => {
    if (!event) return;

    setStatus('confirming');

    try {
      const res = await fetch('/api/calendar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: event.title,
          start: event.start,
          end: event.end,
          attendees: event.attendees,
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
        <div style={{ color: '#1565c0' }}>Creating event...</div>
      </div>
    );
  }

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
        <div style={{ color: '#c62828' }}>Event creation cancelled</div>
      </div>
    );
  }

  if (status === 'confirmed' && savedEvent) {
    return (
      <div style={{
        margin: '8px 0',
        padding: 12,
        background: '#e8f5e9',
        borderRadius: 8,
        border: '1px solid #4caf50',
        fontSize: 14
      }}>
        <div style={{ fontWeight: 500, marginBottom: 8, color: '#2e7d32' }}>
          Event Created
        </div>
        <div style={{ fontWeight: 600 }}>{savedEvent.title}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
          {formatDateTime(savedEvent.start)} - {formatDateTime(savedEvent.end).split(', ').pop()}
        </div>
        {savedEvent.attendees?.length > 0 && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            Attendees: {savedEvent.attendees.join(', ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      margin: '8px 0',
      padding: 12,
      background: '#fff3e0',
      borderRadius: 8,
      border: '1px solid #ff9800',
      fontSize: 14
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8, color: '#e65100' }}>
        Confirm New Event
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>{event?.title}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
          {event && formatDateTime(event.start)} - {event && formatDateTime(event.end).split(', ').pop()}
        </div>
        {event?.attendees?.length > 0 && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            Attendees: {event.attendees.join(', ')}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleConfirm}
          disabled={status === 'confirming'}
          style={{
            padding: '6px 16px',
            background: status === 'confirming' ? '#ccc' : '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'confirming' ? 'not-allowed' : 'pointer',
            fontSize: 14,
          }}
        >
          {status === 'confirming' ? 'Saving...' : 'Confirm'}
        </button>
        <button
          onClick={handleCancel}
          disabled={status === 'confirming'}
          style={{
            padding: '6px 16px',
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
