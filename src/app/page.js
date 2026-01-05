"use client";
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Home() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {messages.map(m => (
              <div key={m.id} style={{ whiteSpace: 'pre-wrap' }}>
                <div style={{ fontWeight: 600 }}>{m.role === 'user' ? 'You' : 'AI'}</div>
                <div>
                  {m.parts
                    ? m.parts.map((part, i) => {
                        if (part.type === 'text') {
                          return <span key={i}>{part.text}</span>;
                        }
                        // Handle tool calls - type is 'tool-{toolName}'
                        if (part.type?.startsWith('tool-')) {
                          return (
                            <div key={i} style={{
                              margin: '8px 0',
                              padding: 12,
                              background: '#f5f5f5',
                              borderRadius: 8,
                              fontSize: 14
                            }}>
                              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                                📅 {part.type.replace('tool-', '')}
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
                            </div>
                          );
                        }
                        return null;
                      })
                    : m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                <div style={{ fontWeight: 600 }}>AI</div>
                <div style={{ color: '#666' }}>⏳ Thinking...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{ flex: 1, padding: 10 }}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
