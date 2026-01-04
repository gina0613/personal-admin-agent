import { streamText, convertToModelMessages, tool, jsonSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { findFreeSlots } from '@/lib/calendar';

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

  const today = new Date().toISOString().split('T')[0];

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful assistant that provides concise answers. Today's date is ${today}.`,
    messages: modelMessages,
    maxSteps: 3,
    tools: {
      findFreeSlots: tool({
        description: 'Find available/free time slots in the calendar for a given date. Use this when user asks about availability, free time, or open slots.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format. Use today if not specified.',
            },
          },
          required: ['date'],
        }),
        execute: async ({ date }) => {
          const slots = await findFreeSlots(date);
          return { date, freeSlots: slots };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}