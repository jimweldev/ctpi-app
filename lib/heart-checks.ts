"use client"

import * as React from "react"

import { toDateKey } from "@/lib/heart-check-schedules"
import { createLocalList } from "@/lib/local-list"

/** A self-check of where your heart is, at one moment. */
export type HeartCheck = {
  id: string
  soil: Soil
  details?: string
  /** Local "YYYY-MM-DD" the check is for; defaults to the day it was added. */
  date: string
  createdAt: number
}

/** The four soils from the parable of the sower (Matthew 13:1-23). */
export type Soil = "path" | "rocky" | "thorns" | "good"

/** Least to most fruitful; `level` is the number of filled hearts. */
export const SOILS: {
  soil: Soil
  level: number
  label: string
  description: string
}[] = [
  {
    soil: "path",
    level: 1,
    label: "Path",
    description: "The word isn't taking root in me",
  },
  {
    soil: "rocky",
    level: 2,
    label: "Rocky ground",
    description: "I started well, but I'm wilting under pressure",
  },
  {
    soil: "thorns",
    level: 3,
    label: "Among thorns",
    description: "Worries and wants are choking the word",
  },
  {
    soil: "good",
    level: 4,
    label: "Good soil",
    description: "The word is growing and bearing fruit",
  },
]

export function getSoil(soil: Soil) {
  return SOILS.find((item) => item.soil === soil) ?? SOILS[0]
}

/** Checks saved before the soils had a 1-3 `level` (Struggling, Steady, Thriving). */
const LEGACY_SOILS: Record<number, Soil> = {
  1: "rocky",
  2: "thorns",
  3: "good",
}

type StoredHeartCheck = Omit<HeartCheck, "soil"> & {
  soil?: Soil
  level?: number
}

function normalize({ level, ...check }: StoredHeartCheck): HeartCheck {
  return {
    ...check,
    soil: check.soil ?? LEGACY_SOILS[level ?? 0] ?? "path",
    // Checks saved before dates existed fall back to the day added.
    date: check.date || toDateKey(new Date(check.createdAt)),
  }
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
        .map(normalize)
        .sort(
          (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
        ),
    [checks]
  )
}

export function addHeartCheck(
  check: Pick<HeartCheck, "soil" | "details" | "date">
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
  patch: Partial<Pick<HeartCheck, "soil" | "details" | "date">>
) {
  write(
    read().map((check) =>
      check.id === id ? { ...normalize(check), ...patch } : check
    )
  )
}

export const getHeartChecks = read

/** Add valid heart checks from a backup; returns how many were new. */
export function importHeartChecks(items: unknown[]) {
  return merge(items.filter(isHeartCheck).map(normalize))
}

function isHeartCheck(value: unknown): value is StoredHeartCheck {
  const check = value as StoredHeartCheck
  return (
    typeof check?.id === "string" &&
    (SOILS.some((item) => item.soil === check.soil) ||
      (check.level ?? 0) in LEGACY_SOILS) &&
    typeof check.date === "string" &&
    typeof check.createdAt === "number"
  )
}
