import EmailDraft from './EmailDraft';
import FreeSlots from './FreeSlots';
import GenericTool from './GenericTool';

const toolComponents = {
  emailDraft: EmailDraft,
  findFreeSlots: FreeSlots,
};

export default function ToolRenderer({ part }) {
  const toolName = part.type?.replace('tool-', '');

  if (!toolName) return null;

  const ToolComponent = toolComponents[toolName];

  if (ToolComponent) {
    return <ToolComponent part={part} />;
  }

  return <GenericTool part={part} toolName={toolName} />;
}
