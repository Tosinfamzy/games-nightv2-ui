import { googleCalendarUrl, icsDataUrl } from '../lib/calendar'
import type { CalendarEvent } from '../lib/calendar'

/**
 * "Add to calendar" links for a games-night event. The .ics download covers
 * Apple / iCloud Calendar (tapping it on iOS offers "Add to Calendar") and
 * Outlook; the Google link covers Google Calendar users.
 */
export function AddToCalendar({ event }: { event: CalendarEvent }) {
  if (!event.start) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href={icsDataUrl(event)}
        download="games-night.ics"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
      >
        📅 Apple / Outlook
      </a>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
      >
        📆 Google Calendar
      </a>
    </div>
  )
}
