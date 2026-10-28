"use client"

import { createLocalList } from "@/lib/local-list"

export type Prayer = {
  id: string
  /** What to pray for, e.g. "Mom's recovery". */
  title: string
  /** When God answered it; missing while still praying. */
  answeredAt?: number
  createdAt: number
}

const { read, write, merge, useList } = createLocalList<Prayer>("ctpi:prayers")

export const usePrayers = useList

export function addPrayer(prayer: Pick<Prayer, "title">) {
  write([
    { ...prayer, id: crypto.randomUUID(), createdAt: Date.now() },
    ...read(),
  ])
}

export function updatePrayer(
  id: string,
  patch: Partial<Pick<Prayer, "title" | "answeredAt">>
) {
  write(
    read().map((prayer) =>
      prayer.id === id ? { ...prayer, ...patch } : prayer
    )
  )
}

export function removePrayer(id: string) {
  write(read().filter((prayer) => prayer.id !== id))
}

/** Save the prayers in the order the user arranged them. */
export function reorderPrayers(prayers: Prayer[]) {
  write(prayers)
}

export function clearPrayers() {
  write([])
}

export const getPrayers = read

/** Add valid prayers from a backup; returns how many were new. */
export function importPrayers(items: unknown[]) {
  return merge(items.filter(isPrayer))
}

function isPrayer(value: unknown): value is Prayer {
  const prayer = value as Prayer
  return (
    typeof prayer?.id === "string" &&
    typeof prayer.title === "string" &&
    typeof prayer.createdAt === "number"
  )
}
