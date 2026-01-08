import { streamText, convertToModelMessages, tool, jsonSchema } from 'ai';
import { openai } from '@ai-sdk/openai';
import { findFreeSlots } from '@/lib/calendar';
import { createTodo, getTodos } from '@/lib/todos';
import { lookupContact } from '@/lib/contacts';

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

  // Guardrail: 30s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const result = await streamText({
    model: openai('gpt-4o'),
    abortSignal: controller.signal,
    maxRetries: 3, // Guardrail: retry up to 3 times
    system: `You are a helpful personal assistant that manages calendar, emails, and todos. Today's date is ${today}.

    When a task requires multiple steps:
    1. Call the necessary tools in sequence
    2. Use results from previous tools to inform the next tool call
    3. For meeting scheduling: first find free slots, then draft the email with options

    Always be proactive - if user asks to schedule a meeting AND send an email, do both.`,
    messages: modelMessages,
    maxSteps: 5,
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
      emailDraft: tool({
        description: 'Generate an email draft. Use this when user wants to write, draft, or compose an email. YOU must generate the subject and body content.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email or name',
            },
            subject: {
              type: 'string',
              description: 'The email subject line - generate this based on the purpose',
            },
            body: {
              type: 'string',
              description: 'The full email body content - generate this based on the purpose and tone',
            },
            tone: {
              type: 'string',
              enum: ['formal', 'casual', 'friendly'],
              description: 'The tone used for the email',
            },
          },
          required: ['to', 'subject', 'body'],
        }),
        execute: async ({ to, subject, body, tone = 'formal' }) => {
          // Return the draft for display in UI
          return {
            to,
            subject,
            body,
            tone,
            createdAt: new Date().toISOString(),
          };
        },
      }),
      todoCreate: tool({
        description: 'Create a new todo/task item. Use this when user wants to add, create, or remember a task.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The todo title/description',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Priority level. Default is medium.',
            },
            dueDate: {
              type: 'string',
              description: 'Due date in YYYY-MM-DD format (optional)',
            },
          },
          required: ['title'],
        }),
        execute: async ({ title, priority = 'medium', dueDate = null }) => {
          const todo = await createTodo(title, priority, dueDate);
          return todo;
        },
      }),
      calendarCreateEvent: tool({
        description: 'Create a new calendar event. Use this when user wants to add, create, or schedule an event on their calendar. The event will require user confirmation before being saved.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Event title/name',
            },
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format',
            },
            startTime: {
              type: 'string',
              description: 'Start time in HH:MM format (24-hour)',
            },
            endTime: {
              type: 'string',
              description: 'End time in HH:MM format (24-hour)',
            },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of attendee names or emails (optional)',
            },
          },
          required: ['title', 'date', 'startTime', 'endTime'],
        }),
        execute: async ({ title, date, startTime, endTime, attendees = [] }) => {
          // Return preview for confirmation - NOT saved yet
          return {
            pending: true,
            event: {
              title,
              start: `${date}T${startTime}:00`,
              end: `${date}T${endTime}:00`,
              attendees,
            },
          };
        },
      }),
      contactLookup: tool({
        description: 'Look up contact information by name. Returns email, timezone, and phone. Use this when user asks for someone\'s contact info, email, or timezone.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Contact name to look up',
            },
          },
          required: ['name'],
        }),
        execute: async ({ name }) => {
          const contact = await lookupContact(name);
          if (!contact) {
            return { found: false, name, message: `Contact "${name}" not found` };
          }
          return { found: true, ...contact };
        },
      }),
    },
  });

  clearTimeout(timeout);
  return result.toUIMessageStreamResponse();
}