"use client"

import { createLocalList } from "@/lib/local-list"

export type HeartCheck = {
  id: string
  /** Local date and time as "YYYY-MM-DDTHH:mm" (a datetime-local value). */
  scheduledAt: string
  description?: string
  /** 1 to 5 hearts. A rated check counts as done. */
  rating?: number
  createdAt: number
}

export const MAX_RATING = 5

const { read, write, useList } =
  createLocalList<HeartCheck>("ctpi:heart-checks")

export const useHeartChecks = useList

export function addHeartCheck(
  check: Pick<HeartCheck, "scheduledAt" | "description">
) {
  write([
    ...read(),
    { ...check, id: crypto.randomUUID(), createdAt: Date.now() },
  ])
}

export function rateHeartCheck(id: string, rating: number) {
  write(read().map((check) => (check.id === id ? { ...check, rating } : check)))
}

export function removeHeartCheck(id: string) {
  write(read().filter((check) => check.id !== id))
}

export function clearHeartChecks() {
  write([])
}

export function formatHeartCheckDate(scheduledAt: string) {
  return new Date(scheduledAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
