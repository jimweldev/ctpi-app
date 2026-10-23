import data from "@/data/verses.json"

/** A verse curated by the church, grouped by topic tags. */
export type ChurchVerse = {
  /** Unique, stable id (e.g. "psalm-119-11"). */
  id: string
  reference: string
  version?: string
  text: string
  tags: string[]
}

const { verses } = data as { verses: ChurchVerse[] }

/** Church verses in the order they appear in `data/verses.json`. */
export function getAllVerses() {
  return verses
}

/** Every tag used by at least one verse, alphabetical. */
export function getAllTags() {
  return [...new Set(verses.flatMap((verse) => verse.tags))].sort()
}
