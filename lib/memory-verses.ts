"use client"

import { createLocalList } from "@/lib/local-list"

export type MemoryVerse = {
  id: string
  reference: string
  version?: string
  text: string
  createdAt: number
}

const { read, write, useList } =
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

export function clearMemoryVerses() {
  write([])
}
