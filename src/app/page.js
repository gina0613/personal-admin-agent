"use client";
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Home() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === 'streaming' || status === 'pending';

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
                    ? m.parts.map((part, i) => part.type === 'text' ? <span key={i}>{part.text}</span> : null)
                    : m.content}
                </div>
              </div>
            ))}
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
