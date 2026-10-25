"use client"

import * as React from "react"

import { toDateKey } from "@/lib/heart-check-schedules"
import { createLocalList } from "@/lib/local-list"

/** A self-check of where your heart is, at one moment. */
export type HeartCheck = {
  id: string
  level: HeartLevel
  details?: string
  /** Local "YYYY-MM-DD" the check is for; defaults to the day it was added. */
  date: string
  createdAt: number
}

export type HeartLevel = 1 | 2 | 3

export const HEART_LEVELS: {
  level: HeartLevel
  label: string
  description: string
}[] = [
  { level: 1, label: "Struggling", description: "My heart feels far from God" },
  { level: 2, label: "Steady", description: "Holding on, with room to grow" },
  { level: 3, label: "Thriving", description: "Close to God and full of love" },
]

export function getHeartLevel(level: HeartLevel) {
  return HEART_LEVELS.find((item) => item.level === level) ?? HEART_LEVELS[0]
}

const { read, write, merge, useList } = createLocalList<HeartCheck>(
  "ctpi:heart-check-entries"
)

/** Heart checks, newest date first (most recently added first within a day). */
export function useHeartChecks() {
  const checks = useList()
  return React.useMemo(
    () =>
      checks
        // Checks saved before dates existed fall back to the day added.
        .map((check) =>
          check.date
            ? check
            : { ...check, date: toDateKey(new Date(check.createdAt)) }
        )
        .sort(
          (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
        ),
    [checks]
  )
}

export function addHeartCheck(
  check: Pick<HeartCheck, "level" | "details" | "date">
) {
  write([
    { ...check, id: crypto.randomUUID(), createdAt: Date.now() },
    ...read(),
  ])
}

export function removeHeartCheck(id: string) {
  write(read().filter((check) => check.id !== id))
}

export function clearHeartChecks() {
  write([])
}

export function updateHeartCheck(
  id: string,
  patch: Partial<Pick<HeartCheck, "level" | "details" | "date">>
) {
  write(
    read().map((check) => (check.id === id ? { ...check, ...patch } : check))
  )
}

export const getHeartChecks = read

/** Add valid heart checks from a backup; returns how many were new. */
export function importHeartChecks(items: unknown[]) {
  return merge(items.filter(isHeartCheck))
}

function isHeartCheck(value: unknown): value is HeartCheck {
  const check = value as HeartCheck
  return (
    typeof check?.id === "string" &&
    HEART_LEVELS.some((item) => item.level === check.level) &&
    typeof check.date === "string" &&
    typeof check.createdAt === "number"
  )
}
