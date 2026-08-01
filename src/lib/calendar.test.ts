import { describe, it, expect } from 'vitest'
import { buildIcs, icsDataUrl, googleCalendarUrl } from './calendar'

const event = {
  title: 'Live Pass',
  start: '2026-08-16T12:13:00Z',
  location: 'Halo Tower',
  description: 'Games night hosted by Tosin.',
  uid: 'abc-123',
}

describe('calendar', () => {
  it('builds a well-formed .ics with UTC times and a 3h default duration', () => {
    const ics = buildIcs(event)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('UID:abc-123@thegamesnight.com')
    expect(ics).toContain('DTSTART:20260816T121300Z')
    // 12:13 + 3h = 15:13
    expect(ics).toContain('DTEND:20260816T151300Z')
    expect(ics).toContain('SUMMARY:Live Pass')
    expect(ics).toContain('LOCATION:Halo Tower')
    // CRLF line endings per the iCal spec.
    expect(ics.includes('\r\n')).toBe(true)
  })

  it('escapes commas/semicolons in text fields', () => {
    const ics = buildIcs({
      title: 'Trivia, Charades; & more',
      start: '2026-08-16T12:13:00Z',
    })
    expect(ics).toContain('SUMMARY:Trivia\\, Charades\\; & more')
  })

  it('icsDataUrl is a text/calendar data URL', () => {
    expect(icsDataUrl(event)).toMatch(/^data:text\/calendar;charset=utf-8,/)
  })

  it('googleCalendarUrl carries the title, dates, and location', () => {
    const url = googleCalendarUrl(event)
    expect(url).toContain('calendar.google.com')
    expect(url).toContain('dates=20260816T121300Z%2F20260816T151300Z')
    expect(url).toContain('text=Live+Pass')
    expect(url).toContain('location=Halo+Tower')
  })
})
