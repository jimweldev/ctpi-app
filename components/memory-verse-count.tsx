"use client"

import { useMemoryVerses } from "@/lib/memory-verses"

function MemoryVerseCount() {
  const count = useMemoryVerses().length

  return (
    <span className="text-xs text-muted-foreground">
      {count === 0
        ? "Add your first"
        : `${count} ${count === 1 ? "verse" : "verses"} saved`}
    </span>
  )
}

export { MemoryVerseCount }
