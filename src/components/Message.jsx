import ToolRenderer from './tools';

export default function Message({ message }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      <div style={{ fontWeight: 600 }}>
        {message.role === 'user' ? 'You' : 'AI'}
      </div>
      <div>
        {message.parts
          ? message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <span key={i}>{part.text}</span>;
              }
              if (part.type?.startsWith('tool-')) {
                return <ToolRenderer key={i} part={part} />;
              }
              return null;
            })
          : message.content}
      </div>
    </div>
  );
}
