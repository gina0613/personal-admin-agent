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

For scheduling meetings with someone, use the scheduleMeeting tool - it handles everything in one call:
- Looks up contact info
- Finds free time slots
- Creates event + email draft preview
- User confirms before saving

Use scheduleMeeting when user says: 约会议, schedule meeting, 安排会议, book meeting, etc.`,
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
        description: 'Create a new calendar event with optional email draft. Use after findFreeSlots. Include email draft info if user wants to send meeting invite. Requires user confirmation before saving.',
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
            emailTo: {
              type: 'string',
              description: 'Email recipient (optional, for meeting invite)',
            },
            emailSubject: {
              type: 'string',
              description: 'Email subject (optional)',
            },
            emailBody: {
              type: 'string',
              description: 'Email body with meeting time options (optional)',
            },
          },
          required: ['title', 'date', 'startTime', 'endTime'],
        }),
        execute: async ({ title, date, startTime, endTime, attendees = [], emailTo, emailSubject, emailBody }) => {
          // Return preview for confirmation - NOT saved yet
          const result = {
            pending: true,
            event: {
              title,
              start: `${date}T${startTime}:00`,
              end: `${date}T${endTime}:00`,
              attendees,
            },
          };
          // Include email draft if provided
          if (emailTo && emailSubject && emailBody) {
            result.emailDraft = {
              to: emailTo,
              subject: emailSubject,
              body: emailBody,
            };
          }
          return result;
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
      scheduleMeeting: tool({
        description: 'Schedule a meeting with someone. Looks up contact, finds free slots, creates event + email draft. Use for: 约会议, schedule meeting, 安排会议, book meeting.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            attendeeName: {
              type: 'string',
              description: 'Name of the person to meet with',
            },
            date: {
              type: 'string',
              description: 'Date in YYYY-MM-DD format',
            },
            duration: {
              type: 'number',
              description: 'Duration in minutes (default 30)',
            },
            purpose: {
              type: 'string',
              description: 'Purpose/topic of the meeting',
            },
            preferredTime: {
              type: 'string',
              description: 'Preferred time of day: morning, afternoon, or specific time like 14:00',
            },
          },
          required: ['attendeeName', 'date'],
        }),
        execute: async ({ attendeeName, date, duration = 30, purpose = 'Meeting', preferredTime }) => {
          // 1. Look up contact
          const contact = await lookupContact(attendeeName);

          // 2. Find free slots
          const slots = await findFreeSlots(date);

          // 3. Pick best slot based on preference
          let selectedSlot = slots[0]; // default to first
          if (preferredTime === 'afternoon') {
            selectedSlot = slots.find(s => parseInt(s.start.split(':')[0]) >= 12) || slots[0];
          } else if (preferredTime === 'morning') {
            selectedSlot = slots.find(s => parseInt(s.start.split(':')[0]) < 12) || slots[0];
          } else if (preferredTime && preferredTime.includes(':')) {
            const prefHour = parseInt(preferredTime.split(':')[0]);
            selectedSlot = slots.find(s => parseInt(s.start.split(':')[0]) >= prefHour) || slots[0];
          }

          if (!selectedSlot) {
            return { error: true, message: `No free slots available on ${date}` };
          }

          // Calculate end time
          const [startHour, startMin] = selectedSlot.start.split(':').map(Number);
          const endMinutes = startHour * 60 + startMin + duration;
          const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

          // 4. Generate email draft
          const emailTo = contact?.email || `${attendeeName.toLowerCase()}@example.com`;
          const emailBody = `Hi ${attendeeName},

I'd like to schedule a ${duration}-minute meeting with you on ${date}.

Proposed time: ${selectedSlot.start} - ${endTime}

Topic: ${purpose}

Please let me know if this works for you.

Best regards`;

          return {
            pending: true,
            freeSlots: slots.slice(0, 3), // show top 3 options
            event: {
              title: `${purpose} with ${attendeeName}`,
              start: `${date}T${selectedSlot.start}:00`,
              end: `${date}T${endTime}:00`,
              attendees: [attendeeName],
            },
            emailDraft: {
              to: emailTo,
              subject: `Meeting Request: ${purpose}`,
              body: emailBody,
            },
            contact: contact || { name: attendeeName, email: emailTo },
          };
        },
      }),
    },
  });

  clearTimeout(timeout);
  return result.toUIMessageStreamResponse();
}