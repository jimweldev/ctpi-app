"use client"

import { useSyncExternalStore } from "react"

import { createLocalList } from "@/lib/local-list"

/** A reminder to do a heart check, set like a phone alarm. */
export type HeartCheckSchedule = {
  id: string
  /** 24-hour local time, "HH:mm". */
  time: string
  /** Weekdays it repeats on, 0 = Sunday. Empty for a one-time schedule. */
  days: number[]
  /** "YYYY-MM-DD" of a one-time schedule (when `days` is empty). */
  date?: string
  enabled: boolean
  createdAt: number
}

export type HeartCheckScheduleInput = Pick<
  HeartCheckSchedule,
  "time" | "days" | "date"
>

// Key kept from when these were called alarms, so saved data carries over.
const { read, write, merge, useList } = createLocalList<HeartCheckSchedule>(
  "ctpi:heart-check-alarms"
)

export const useHeartCheckSchedules = useList

export function addHeartCheckSchedule(input: HeartCheckScheduleInput) {
  write([
    ...read(),
    { ...input, id: crypto.randomUUID(), enabled: true, createdAt: Date.now() },
  ])
}

export function updateHeartCheckSchedule(
  id: string,
  patch: Partial<Omit<HeartCheckSchedule, "id" | "createdAt">>
) {
  write(
    read().map((schedule) =>
      schedule.id === id ? { ...schedule, ...patch } : schedule
    )
  )
}

export function removeHeartCheckSchedule(id: string) {
  write(read().filter((schedule) => schedule.id !== id))
}

export function clearHeartCheckSchedules() {
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

/** The next time a schedule is due after `now`, or null if it never will. */
export function nextOccurrence(schedule: HeartCheckSchedule, now: number) {
  if (!schedule.enabled) return null
  if (schedule.days.length === 0) {
    if (!schedule.date) return null
    const due = at(schedule.date, schedule.time)
    return due.getTime() > now ? due : null
  }
  const today = new Date(now)
  for (let offset = 0; offset <= 7; offset++) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset
    )
    if (!schedule.days.includes(day.getDay())) continue
    const due = at(toDateKey(day), schedule.time)
    if (due.getTime() > now) return due
  }
  return null
}

/** When the schedule is due on a "YYYY-MM-DD" day, or null if it isn't. */
export function dueOn(schedule: HeartCheckSchedule, dateKey: string) {
  if (!schedule.enabled) return null
  const scheduled =
    schedule.days.length === 0
      ? schedule.date === dateKey
      : schedule.days.includes(at(dateKey, "00:00").getDay())
  return scheduled ? at(dateKey, schedule.time) : null
}

/** When the schedule was due earlier today, or null if it wasn't. */
export function dueEarlierToday(schedule: HeartCheckSchedule, now: number) {
  const due = dueOn(schedule, toDateKey(new Date(now)))
  return due && due.getTime() <= now ? due : null
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

export const getHeartCheckSchedules = read

/** Add valid schedules from a backup; returns how many were new. */
export function importHeartCheckSchedules(items: unknown[]) {
  return merge(items.filter(isHeartCheckSchedule))
}

function isHeartCheckSchedule(value: unknown): value is HeartCheckSchedule {
  const schedule = value as HeartCheckSchedule
  return (
    typeof schedule?.id === "string" &&
    /^\d{2}:\d{2}$/.test(schedule.time) &&
    Array.isArray(schedule.days) &&
    typeof schedule.enabled === "boolean" &&
    typeof schedule.createdAt === "number"
  )
}
