import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req) {
  const body = await req.json();

  let modelMessages;

  if (body.text) {
    modelMessages = [{ role: 'user', content: body.text }];
  } else if (body.messages) {
    modelMessages = await convertToModelMessages(body.messages);
  } else {
    return new Response('Missing `text` or `messages` in request body', { status: 400 });
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: 'you are a helpful assistant that provides concise answers.',
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}