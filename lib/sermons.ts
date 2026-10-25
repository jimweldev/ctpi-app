import data from "@/data/sermons.json"

export type Verse = {
  type: "verse"
  reference: string
  version?: string
  verses: { number: number; text: string }[]
}

export type Block =
  | Verse
  /**
   * Shown as written: line breaks kept, a blank line starts a new paragraph,
   * `**bold**`, `*italic*`, and `->centered paragraph<-`.
   */
  | { type: "note"; text: string }
  | { type: "point"; title: string; content: Block[] }
  | { type: "section"; title: string; content: Block[] }

export type Series = {
  slug: string
  title: string
  subtitle?: string
  scripture?: Omit<Verse, "type">
}

export type Sermon = {
  slug: string
  title: string
  /** Shown under the title, e.g. the armor piece a sermon covers. */
  subtitle?: string
  /** Slug of the series this sermon belongs to; omit for a standalone sermon. */
  series?: string
  /** ISO date (YYYY-MM-DD); sermons are listed newest first. */
  date: string
  speaker?: string
  content: Block[]
  /** Closing blocks after the last point, shown in their own tab. */
  outro?: Block[]
}

/** A sermon with its series resolved and its position within that series. */
export type SermonEntry = Sermon & {
  /** `part` counts from the series' first sermon by date. */
  seriesInfo?: Series & { part: number }
}

// JSON imports widen string literals, so assert the shape once here.
const { series, sermons } = data as { series: Series[]; sermons: Sermon[] }

const entries: SermonEntry[] = sermons
  .map((sermon) => {
    const info = series.find((s) => s.slug === sermon.series)
    if (!info) return sermon
    const parts = sermons
      .filter((s) => s.series === info.slug)
      .sort((a, b) => a.date.localeCompare(b.date))
    return {
      ...sermon,
      seriesInfo: { ...info, part: parts.indexOf(sermon) + 1 },
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

/** All sermons, newest first. */
export function getAllSermons() {
  return entries
}

export function getSermon(slug: string) {
  return entries.find((s) => s.slug === slug) ?? null
}

/** The previous and next sermon in the same series, by part number. */
export function getSeriesNeighbors(sermon: SermonEntry) {
  if (!sermon.seriesInfo) return { previous: null, next: null }
  const { slug, part } = sermon.seriesInfo
  const find = (p: number) =>
    entries.find((s) => s.series === slug && s.seriesInfo?.part === p) ?? null
  return { previous: find(part - 1), next: find(part + 1) }
}

export function formatSermonDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Split a sermon into its intro (everything before the first point) and its
 * points, each with the non-point blocks (e.g. a section) that follow it.
 */
export function getSermonParts(content: Block[]) {
  const intro: Block[] = []
  const points: Block[][] = []
  for (const block of content) {
    if (block.type === "point") points.push([block])
    else (points.at(-1) ?? intro).push(block)
  }
  return { intro, points }
}

/** All series, in the order listed in the data. */
export function getAllSeries() {
  return series
}

/**
 * Everything worth searching in a sermon, flattened to plain text: title,
 * series, speaker, point and section titles, verse references, and notes.
 */
export function getSermonSearchText(sermon: SermonEntry) {
  const parts = [
    sermon.title,
    sermon.subtitle,
    sermon.seriesInfo?.title,
    sermon.speaker,
  ]
  const walk = (blocks: Block[]) => {
    for (const block of blocks) {
      if (block.type === "verse") parts.push(block.reference)
      else if (block.type === "note") parts.push(stripFormatting(block.text))
      else {
        parts.push(block.title)
        walk(block.content)
      }
    }
  }
  walk([...sermon.content, ...(sermon.outro ?? [])])
  return parts.filter(Boolean).join(" ")
}

/**
 * A sermon's notes as plain text, in order, for quoting on their own. Long
 * notes are left out, since they don't read well out of context.
 */
export function getSermonNotes(sermon: Sermon, maxLength = 240) {
  const notes: string[] = []
  const walk = (blocks: Block[]) => {
    for (const block of blocks) {
      if (block.type === "note") notes.push(stripFormatting(block.text).trim())
      else if (block.type !== "verse") walk(block.content)
    }
  }
  walk([...sermon.content, ...(sermon.outro ?? [])])
  return notes.filter((note) => note && note.length <= maxLength)
}

/** Remove the note/verse formatting markers, keeping the words. */
function stripFormatting(text: string) {
  return text
    .replace(/\[([^\]]+)\]\{[^}]+\}/g, "$1")
    .replace(/\*\*|\*|->|<-/g, "")
}
