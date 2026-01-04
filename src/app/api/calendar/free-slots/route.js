import { findFreeSlots, getEventsForDate } from '@/lib/calendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const workStart = parseInt(searchParams.get('workStart') || '9', 10);
  const workEnd = parseInt(searchParams.get('workEnd') || '18', 10);

  try {
    const [freeSlots, events] = await Promise.all([
      findFreeSlots(date, workStart, workEnd),
      getEventsForDate(date),
    ]);

    return Response.json({
      date,
      workingHours: { start: workStart, end: workEnd },
      events: events.map(e => ({
        title: e.title,
        start: e.start,
        end: e.end,
      })),
      freeSlots,
      totalFreeMinutes: freeSlots.reduce((sum, slot) => sum + slot.durationMinutes, 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
