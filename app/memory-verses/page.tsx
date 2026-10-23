import type { Metadata } from "next"

import { MemoryVerseList } from "@/components/memory-verse-list"

export const metadata: Metadata = {
  title: "Memory Verses",
}

export default function MemoryVersesPage() {
  return <MemoryVerseList />
}
