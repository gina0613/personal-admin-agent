import { useState } from 'react';

export default function ChatInput({ onSend, isLoading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    onSend(text);
  };

  return (
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
  );
}
