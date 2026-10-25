"use client"

import { createLocalList } from "@/lib/local-list"

export const MEMORY_STATUSES = [
  { value: "new", label: "To learn" },
  { value: "learning", label: "Learning" },
  { value: "memorized", label: "Memorized" },
] as const

export type MemoryStatus = (typeof MEMORY_STATUSES)[number]["value"]

export type MemoryVerse = {
  id: string
  reference: string
  version?: string
  text: string
  /** Missing on verses saved before statuses existed: treat as "new". */
  status?: MemoryStatus
  createdAt: number
}

export const getStatus = (verse: MemoryVerse): MemoryStatus =>
  verse.status ?? "new"

const { read, write, merge, useList } =
  createLocalList<MemoryVerse>("ctpi:memory-verses")

export const useMemoryVerses = useList

export function addMemoryVerse(verse: Omit<MemoryVerse, "id" | "createdAt">) {
  write([
    { ...verse, id: crypto.randomUUID(), createdAt: Date.now() },
    ...read(),
  ])
}

export function removeMemoryVerse(id: string) {
  write(read().filter((verse) => verse.id !== id))
}

/** Save the verses in the order the user arranged them. */
export function reorderMemoryVerses(verses: MemoryVerse[]) {
  write(verses)
}

export function clearMemoryVerses() {
  write([])
}

export const getMemoryVerses = read

/** Add valid verses from a backup; returns how many were new. */
export function importMemoryVerses(items: unknown[]) {
  return merge(items.filter(isMemoryVerse))
}

function isMemoryVerse(value: unknown): value is MemoryVerse {
  const verse = value as MemoryVerse
  return (
    typeof verse?.id === "string" &&
    typeof verse.reference === "string" &&
    typeof verse.text === "string" &&
    typeof verse.createdAt === "number"
  )
}

export function updateMemoryVerse(
  id: string,
  patch: Partial<Pick<MemoryVerse, "reference" | "version" | "text" | "status">>
) {
  write(
    read().map((verse) => (verse.id === id ? { ...verse, ...patch } : verse))
  )
}
