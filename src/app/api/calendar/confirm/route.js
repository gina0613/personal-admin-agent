import { createEvent } from '@/lib/calendar';

export async function POST(req) {
  try {
    const { title, start, end, attendees } = await req.json();

    if (!title || !start || !end) {
      return Response.json(
        { error: 'Missing required fields: title, start, end' },
        { status: 400 }
      );
    }

    const event = await createEvent(title, start, end, attendees || []);

    return Response.json({ success: true, event });
  } catch (error) {
    console.error('Failed to create event:', error);
    return Response.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
