"use client"

import Image from "next/image"
import { CalendarIcon } from "lucide-react"

import { toDateKey, useNow } from "@/lib/heart-check-alarms"
import { type ChurchEvent, formatEventDate } from "@/lib/events"

/**
 * Events from today on. Home is prerendered at build time, so past events
 * are filtered here on the device instead of on the server.
 */
function useUpcoming(events: ChurchEvent[]) {
  const now = useNow()
  const today = now === null ? null : toDateKey(new Date(now))
  return today ? events.filter((event) => event.date >= today) : events
}

/** Upcoming events with a heading; renders nothing when there are none. */
function UpcomingEvents({ events }: { events: ChurchEvent[] }) {
  const upcoming = useUpcoming(events)
  if (upcoming.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Upcoming
      </h2>
      {upcoming.map((event) => (
        <article
          key={event.id}
          className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-xs ring-1 ring-foreground/8"
        >
          {event.image && (
            <Image
              src={event.image}
              alt={event.imageAlt ?? event.title}
              width={1920}
              height={1080}
              sizes="(min-width: 672px) 640px, 100vw"
              className="aspect-video h-auto w-full object-cover"
            />
          )}
          <div className="flex flex-col gap-1 p-4">
            <h3 className="text-lg leading-tight font-bold">{event.title}</h3>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarIcon className="size-4" />
              {formatEventDate(event)}
            </p>
            {event.details && (
              <p className="mt-1 text-sm leading-relaxed">{event.details}</p>
            )}
          </div>
        </article>
      ))}
    </section>
  )
}

export { UpcomingEvents }
