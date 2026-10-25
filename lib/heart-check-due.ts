"use client"

import {
  dueEarlierToday,
  dueOn,
  toDateKey,
  useHeartCheckSchedules,
  useNow,
} from "@/lib/heart-check-schedules"
import { useHeartChecks } from "@/lib/heart-checks"

/**
 * True when a schedule was due earlier today and no heart check has been
 * added since. Always false during server render.
 */
export function useHeartCheckDue() {
  const schedules = useHeartCheckSchedules()
  const checks = useHeartChecks()
  const now = useNow()
  if (now === null) return false

  const lastDue = schedules
    .map((schedule) => dueEarlierToday(schedule, now))
    .filter((date) => date !== null)
    .sort((a, b) => b.getTime() - a.getTime())
    .at(0)
  return (
    lastDue != null &&
    !checks.some((check) => check.createdAt >= lastDue.getTime())
  )
}

export type DayStatus =
  /** A heart check was saved for the day. */
  | "done"
  /** A past day with a schedule and no heart check. */
  | "missed"
  /** Today, a schedule has passed and no check was added since. */
  | "due"
  /** Today, a schedule is still ahead. */
  | "later"
  /** Nothing scheduled and nothing saved. */
  | "none"

/**
 * Heart check status for the last 7 days, oldest first and ending today, and
 * how many past days were missed. Only schedules turned on now count, and
 * only for days after they were created. Null during server render.
 */
export function useHeartCheckWeek() {
  const schedules = useHeartCheckSchedules()
  const checks = useHeartChecks()
  const due = useHeartCheckDue()
  const now = useNow()
  if (now === null) return null

  const today = new Date(now)
  const checked = new Set(checks.map((check) => check.date))
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = toDateKey(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 6 + index
      )
    )
    const times = schedules
      .map((schedule) => {
        const at = dueOn(schedule, date)
        return at && at.getTime() >= schedule.createdAt ? at.getTime() : null
      })
      .filter((time) => time !== null)

    let status: DayStatus = "none"
    if (index === 6) {
      if (due) status = "due"
      else if (checked.has(date)) status = "done"
      else if (times.some((time) => time > now)) status = "later"
    } else if (checked.has(date)) status = "done"
    else if (times.length > 0) status = "missed"
    return { date, status }
  })

  return {
    days,
    missed: days.filter((day) => day.status === "missed").length,
    scheduled: schedules.some((schedule) => schedule.enabled),
  }
}
