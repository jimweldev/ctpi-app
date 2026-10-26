"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpenIcon, ChevronRightIcon } from "lucide-react"

import { FilterChips } from "@/components/filter-chips"
import { matchesSearch, SearchField } from "@/components/search-field"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/** The slice of a sermon the list needs, so the full content isn't sent. */
export type SermonListItem = {
  slug: string
  title: string
  subtitle?: string
  date: string
  series?: { slug: string; title: string; part: number }
  searchText: string
}

export type SermonListSeries = {
  slug: string
  title: string
  subtitle?: string
}

const ALL = "all"
const STANDALONE = "standalone"

/** Consecutive sermons grouped by month, keeping the list's order. */
function groupByMonth(sermons: SermonListItem[]) {
  const groups: { month: string; sermons: SermonListItem[] }[] = []
  for (const sermon of sermons) {
    const month = sermon.date.slice(0, 7)
    const last = groups.at(-1)
    if (last?.month === month) last.sermons.push(sermon)
    else groups.push({ month, sermons: [sermon] })
  }
  return groups
}

function formatMonth(month: string) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

function SermonList({
  sermons,
  series,
}: {
  sermons: SermonListItem[]
  series: SermonListSeries[]
}) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState(ALL)

  const hasStandalone = sermons.some((sermon) => !sermon.series)
  const options = [
    { value: ALL, label: "All" },
    ...series.map((s) => ({ value: s.slug, label: s.title })),
    ...(hasStandalone ? [{ value: STANDALONE, label: "Standalone" }] : []),
  ]
  const selectedSeries = series.find((s) => s.slug === filter)

  const shown = sermons.filter(
    (sermon) =>
      (filter === ALL ||
        (filter === STANDALONE
          ? !sermon.series
          : sermon.series?.slug === filter)) &&
      matchesSearch(query, sermon.searchText)
  )

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search sermons, verses, notes"
      />
      <FilterChips
        label="Filter by series"
        options={options}
        value={filter}
        onChange={setFilter}
      />
      {selectedSeries && (
        <div className="flex flex-col gap-1 rounded-3xl bg-hero p-5 text-hero-foreground">
          <span className="text-sm font-semibold text-gold">
            Series · {sermons.filter((s) => s.series?.slug === filter).length}{" "}
            parts
          </span>
          <p className="text-xl leading-tight font-bold tracking-tight">
            {selectedSeries.title}
          </p>
          {selectedSeries.subtitle && (
            <p className="font-serif text-sm italic opacity-85">
              {selectedSeries.subtitle}
            </p>
          )}
        </div>
      )}
      {shown.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenIcon />
            </EmptyMedia>
            <EmptyTitle>No sermons found</EmptyTitle>
            <EmptyDescription>
              Try another word or a different series.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groupByMonth(shown).map((group) => (
          <section key={group.month} className="flex flex-col gap-3">
            <h2 className="px-1 pt-2 text-sm font-semibold text-muted-foreground">
              {formatMonth(group.month)}
            </h2>
            <ul className="flex flex-col gap-3">
              {group.sermons.map((sermon) => (
                <li key={sermon.slug}>
                  <SermonRow sermon={sermon} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function SermonRow({ sermon }: { sermon: SermonListItem }) {
  const date = new Date(`${sermon.date}T00:00:00`)

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/6 transition-transform active:scale-[0.98]"
    >
      <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <span className="text-[0.6875rem] font-medium">
          {date.toLocaleDateString("en-US", { weekday: "short" })}
        </span>
        <span className="text-xl leading-none font-bold">
          {String(date.getDate()).padStart(2, "0")}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {sermon.series && (
          <span className="flex items-center gap-1.5">
            <span className="shrink-0 rounded-full bg-brand-red/10 px-2 py-0.5 text-xs font-semibold text-brand-red">
              Part {sermon.series.part}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {sermon.series.title}
            </span>
          </span>
        )}
        <span className="leading-snug font-semibold">{sermon.title}</span>
        {sermon.subtitle && (
          <span className="truncate text-sm text-muted-foreground">
            {sermon.subtitle}
          </span>
        )}
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}

export { SermonList }
