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

const ALL = "all"
const STANDALONE = "standalone"

function SermonList({
  sermons,
  series,
}: {
  sermons: SermonListItem[]
  series: { slug: string; title: string }[]
}) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState(ALL)

  const hasStandalone = sermons.some((sermon) => !sermon.series)
  const options = [
    { value: ALL, label: "All" },
    ...series.map((s) => ({ value: s.slug, label: s.title })),
    ...(hasStandalone ? [{ value: STANDALONE, label: "Standalone" }] : []),
  ]

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
        <ul className="flex flex-col gap-3">
          {shown.map((sermon) => {
            const date = new Date(`${sermon.date}T00:00:00`)
            return (
              <li key={sermon.slug}>
                <Link
                  href={`/sermons/${sermon.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-xs ring-1 ring-foreground/8 transition-transform active:scale-[0.98]"
                >
                  <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <span className="text-[0.625rem] font-bold tracking-wider uppercase">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl leading-none font-bold">
                      {String(date.getDate()).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {sermon.series && (
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {sermon.series.title}
                        <span className="text-brand-red">
                          {" "}
                          · Part {sermon.series.part}
                        </span>
                      </span>
                    )}
                    <span className="leading-snug font-semibold">
                      {sermon.title}
                    </span>
                    {sermon.subtitle && (
                      <span className="truncate text-sm text-muted-foreground">
                        {sermon.subtitle}
                      </span>
                    )}
                  </span>
                  <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export { SermonList }
