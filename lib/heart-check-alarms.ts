"use client"

import { useSyncExternalStore } from "react"

import { createLocalList } from "@/lib/local-list"

/** A reminder to do a heart check, set like a phone alarm. */
export type HeartCheckAlarm = {
  id: string
  /** 24-hour local time, "HH:mm". */
  time: string
  /** Weekdays it repeats on, 0 = Sunday. Empty for a one-time alarm. */
  days: number[]
  /** "YYYY-MM-DD" of a one-time alarm (when `days` is empty). */
  date?: string
  enabled: boolean
  createdAt: number
}

export type HeartCheckAlarmInput = Pick<
  HeartCheckAlarm,
  "time" | "days" | "date"
>

const { read, write, useList } = createLocalList<HeartCheckAlarm>(
  "ctpi:heart-check-alarms"
)

export const useHeartCheckAlarms = useList

export function addHeartCheckAlarm(input: HeartCheckAlarmInput) {
  write([
    ...read(),
    { ...input, id: crypto.randomUUID(), enabled: true, createdAt: Date.now() },
  ])
}

export function updateHeartCheckAlarm(
  id: string,
  patch: Partial<Omit<HeartCheckAlarm, "id" | "createdAt">>
) {
  write(
    read().map((alarm) => (alarm.id === id ? { ...alarm, ...patch } : alarm))
  )
}

export function removeHeartCheckAlarm(id: string) {
  write(read().filter((alarm) => alarm.id !== id))
}

export function clearHeartCheckAlarms() {
  write([])
}

/** Local "YYYY-MM-DD" for a date. */
export function toDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function at(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}`)
}

/** The next time an alarm goes off after `now`, or null if it never will. */
export function nextOccurrence(alarm: HeartCheckAlarm, now: number) {
  if (!alarm.enabled) return null
  if (alarm.days.length === 0) {
    if (!alarm.date) return null
    const due = at(alarm.date, alarm.time)
    return due.getTime() > now ? due : null
  }
  const today = new Date(now)
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset
    )
    if (!alarm.days.includes(day.getDay())) continue
    const due = at(toDateKey(day), alarm.time)
    if (due.getTime() > now) return due
  }
  return null
}

/** When the alarm went off earlier today, or null if it hasn't today. */
export function wentOffToday(alarm: HeartCheckAlarm, now: number) {
  if (!alarm.enabled) return null
  const today = new Date(now)
  const key = toDateKey(today)
  const scheduled =
    alarm.days.length === 0
      ? alarm.date === key
      : alarm.days.includes(today.getDay())
  if (!scheduled) return null
  const due = at(key, alarm.time)
  return due.getTime() <= now ? due : null
}

/** "06:30" → { clock: "6:30", period: "AM" } */
export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return {
    clock: `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`,
    period: hours < 12 ? "AM" : "PM",
  }
}

export function formatDay(dateKey: string) {
  return new Date(`${dateKey}T00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

// The current time to the minute, re-read every few seconds while mounted.
function subscribeToClock(listener: () => void) {
  const interval = window.setInterval(listener, 5000)
  return () => window.clearInterval(interval)
}

const getMinute = () => Math.floor(Date.now() / 60_000) * 60_000

/** Current time in ms, floored to the minute; null during server render. */
export function useNow() {
  return useSyncExternalStore(subscribeToClock, getMinute, () => null)
}
