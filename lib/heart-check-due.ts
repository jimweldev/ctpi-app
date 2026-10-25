"use client"

import {
  dueEarlierToday,
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
