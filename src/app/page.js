"use client";
import { useChat } from '@ai-sdk/react';
import Message from '@/components/Message';
import ChatInput from '@/components/ChatInput';

export default function Home() {
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSend = (text) => {
    sendMessage({ text });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            {messages.map(m => (
              <Message key={m.id} message={m} />
            ))}
            {isLoading && (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                <div style={{ fontWeight: 600 }}>AI</div>
                <div style={{ color: '#666' }}>⏳ Thinking...</div>
              </div>
            )}
          </div>

          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
