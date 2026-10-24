import type { Metadata } from "next"

import { MemoryVerseList } from "@/components/memory-verse-list"
import { getAllTags, getAllVerses } from "@/lib/verses"

export const metadata: Metadata = {
  title: "Verses",
}

export default function MemoryVersesPage() {
  return <MemoryVerseList churchVerses={getAllVerses()} tags={getAllTags()} />
}
