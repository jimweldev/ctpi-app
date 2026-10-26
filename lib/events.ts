import data from "@/data/events.json"

/** A church event or announcement shown on Home until its date passes. */
export type ChurchEvent = {
  /** Unique, stable id (e.g. "water-baptism-2026-11"). */
  id: string
  title: string
  /**
   * Local date, "YYYY-MM-DD". Omit for an ongoing announcement (a weekly
   * meeting, merch for sale), which stays on Home until removed here.
   */
  date?: string
  /** Shown instead of a date for a recurring event, e.g. "Weekdays at 5 AM". */
  schedule?: string
  /** 24-hour local time, "HH:mm"; omit for an all-day event. */
  time?: string
  details?: string
  /** 16:9 image in `public/events/`. */
  image?: string
  imageAlt?: string
}

const { events } = data as { events: ChurchEvent[] }

/** Dated events soonest first, then ongoing ones in file order. */
export function getAllEvents() {
  const key = (event: ChurchEvent) =>
    event.date ? `${event.date}T${event.time ?? ""}` : ""
  return [...events].sort((a, b) => {
    const [ka, kb] = [key(a), key(b)]
    if (!ka || !kb) return Number(!ka) - Number(!kb)
    return ka.localeCompare(kb)
  })
}

/** The event's date and time, its schedule, or undefined if it has neither. */
export function formatEventDate(event: ChurchEvent) {
  if (!event.date) return event.schedule
  const date = new Date(`${event.date}T${event.time ?? "00:00"}`)
  const day = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  if (!event.time) return day
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  return `${day} · ${time}`
}
