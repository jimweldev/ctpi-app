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
  seriesInfo?: Series & { part: number; total: number }
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
      seriesInfo: {
        ...info,
        part: parts.indexOf(sermon) + 1,
        total: parts.length,
      },
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
