import data from "@/data/events.json"

/** A church event or announcement shown on Home until its date passes. */
export type ChurchEvent = {
  /** Unique, stable id (e.g. "water-baptism-2026-11"). */
  id: string
  title: string
  /** Local date, "YYYY-MM-DD". */
  date: string
  /** 24-hour local time, "HH:mm"; omit for an all-day event. */
  time?: string
  details?: string
  /** 16:9 image in `public/events/`. */
  image?: string
  imageAlt?: string
}

const { events } = data as { events: ChurchEvent[] }

/** All events, soonest first. */
export function getAllEvents() {
  return [...events].sort((a, b) =>
    `${a.date}T${a.time ?? ""}`.localeCompare(`${b.date}T${b.time ?? ""}`)
  )
}

export function formatEventDate(event: ChurchEvent) {
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
