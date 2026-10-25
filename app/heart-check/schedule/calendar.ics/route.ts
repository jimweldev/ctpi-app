import type { NextRequest } from "next/server"

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]

// "id.YYYYMMDDTHHmm.days", built by `calendarHref` in
// `lib/heart-check-schedules.ts`.
const SCHEDULE = /^([0-9a-f-]{36})\.(\d{8}T\d{4})\.([0-6]{0,7})$/

/**
 * Calendar file with a reminder event per heart check schedule, so the
 * phone's calendar can remind the user even while the app is closed. Times
 * are floating (no time zone), so they stay at the user's local time.
 */
export function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "")
  const link = `${origin}/heart-check`

  const events = searchParams.getAll("s").flatMap((value) => {
    const match = SCHEDULE.exec(value)
    if (!match) return []
    const [, id, start, days] = match
    const repeat = [...new Set(days)].map((day) => BYDAY[Number(day)])
    return [
      "BEGIN:VEVENT",
      `UID:${id}@heart-check.ctpi`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}00`,
      "DURATION:PT10M",
      ...(repeat.length > 0
        ? [`RRULE:FREQ=WEEKLY;BYDAY=${repeat.join(",")}`]
        : []),
      "SUMMARY:Heart check",
      `DESCRIPTION:Take a moment to check where your heart is today.\\n${link}`,
      `URL:${link}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Time for your heart check",
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    ]
  })

  if (events.length === 0) {
    return new Response("No heart check schedules to add.", { status: 400 })
  }

  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calvary Temple Philippines//Heart Check//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Heart Check",
    ...events,
    "END:VCALENDAR",
  ]

  return new Response(calendar.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="heart-check.ics"',
      "Cache-Control": "no-store",
    },
  })
}

/** Split lines over 75 characters, as calendar files require. */
function fold(line: string) {
  const parts = [line.slice(0, 75)]
  for (let i = 75; i < line.length; i += 74) parts.push(line.slice(i, i + 74))
  return parts.join("\r\n ")
}
