/**
 * Calendar links for a games-night event. Produces an .ics file (Apple /
 * iCloud, Outlook, and any calendar app can import it) and a Google Calendar
 * "add event" URL, so a guest can save the date from the RSVP page.
 */

export interface CalendarEvent {
  title: string
  /** ISO start time. */
  start: string
  /** Event location (optional). */
  location?: string | null
  /** Free-text description (optional). */
  description?: string | null
  /** Stable id used for the .ics UID (e.g. the RSVP/invite token). */
  uid?: string
}

/** Default games-night length when no end time is known. */
const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000

/** Format a Date as an iCal UTC timestamp: YYYYMMDDTHHMMSSZ. */
function toIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/** Escape a value for an .ics text field (commas, semicolons, newlines). */
function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Build the raw .ics text for an event. Uses a fixed PRODID and a UTC start;
 * end defaults to start + 3h. Safe to hand to a data: URL or a Blob download.
 */
export function buildIcs(event: CalendarEvent): string {
  const start = new Date(event.start)
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS)
  // A stable UID keeps re-adds from creating duplicate calendar entries.
  const uid = `${event.uid ?? toIcsUtc(start)}@thegamesnight.com`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Games Night//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    // No Date.now() dependency issues in the browser; DTSTAMP marks creation.
    `DTSTAMP:${toIcsUtc(start)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ]
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`)
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`)
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  // iCal requires CRLF line endings.
  return lines.join('\r\n')
}

/** A data: URL for the .ics — tapping it on iOS offers "Add to Calendar". */
export function icsDataUrl(event: CalendarEvent): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(
    buildIcs(event),
  )}`
}

/** A Google Calendar "add event" URL (for guests who live in Google Calendar). */
export function googleCalendarUrl(event: CalendarEvent): string {
  const start = new Date(event.start)
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
  })
  if (event.location) params.set('location', event.location)
  if (event.description) params.set('details', event.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
