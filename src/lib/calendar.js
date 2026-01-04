import { promises as fs } from 'fs';
import path from 'path';

/**
 * Read calendar events from mock JSON file
 */
async function getEvents() {
  const filePath = path.join(process.cwd(), 'src/data/calendar.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data).events;
}

/**
 * Find free time slots for a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} workStart - Working hours start (0-23), default 9
 * @param {number} workEnd - Working hours end (0-23), default 18
 * @returns {Promise<Array<{start: string, end: string, durationMinutes: number}>>}
 */
export async function findFreeSlots(date, workStart = 9, workEnd = 18) {
  const events = await getEvents();

  // Filter events for the requested date
  const dayEvents = events
    .filter(event => event.start.startsWith(date))
    .map(event => ({
      start: new Date(event.start),
      end: new Date(event.end),
      title: event.title,
    }))
    .sort((a, b) => a.start - b.start);

  // Define working hours boundaries
  const dayStart = new Date(`${date}T${String(workStart).padStart(2, '0')}:00:00`);
  const dayEnd = new Date(`${date}T${String(workEnd).padStart(2, '0')}:00:00`);

  const freeSlots = [];
  let currentTime = dayStart;

  for (const event of dayEvents) {
    // Skip events outside working hours
    if (event.end <= dayStart || event.start >= dayEnd) continue;

    // Clamp event to working hours
    const eventStart = event.start < dayStart ? dayStart : event.start;
    const eventEnd = event.end > dayEnd ? dayEnd : event.end;

    // If there's a gap before this event, it's free time
    if (currentTime < eventStart) {
      const durationMinutes = (eventStart - currentTime) / (1000 * 60);
      freeSlots.push({
        start: formatTime(currentTime),
        end: formatTime(eventStart),
        durationMinutes,
      });
    }

    // Move current time to end of this event
    if (eventEnd > currentTime) {
      currentTime = eventEnd;
    }
  }

  // Check for free time after last event until end of working hours
  if (currentTime < dayEnd) {
    const durationMinutes = (dayEnd - currentTime) / (1000 * 60);
    freeSlots.push({
      start: formatTime(currentTime),
      end: formatTime(dayEnd),
      durationMinutes,
    });
  }

  return freeSlots;
}

/**
 * Format Date to HH:MM string
 */
function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

/**
 * Get events for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 */
export async function getEventsForDate(date) {
  const events = await getEvents();
  return events.filter(event => event.start.startsWith(date));
}
