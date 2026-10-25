"use client"

import * as React from "react"
import { BookmarkCheckIcon, BookmarkPlusIcon } from "lucide-react"

import { FilterChips } from "@/components/filter-chips"
import { matchesSearch, SearchField } from "@/components/search-field"
import { Button } from "@/components/ui/button"
import { addMemoryVerse, useMemoryVerses } from "@/lib/memory-verses"
import type { ChurchVerse } from "@/lib/verses"

function VerseLibrary({
  verses,
  tags,
}: {
  verses: ChurchVerse[]
  tags: string[]
}) {
  const [tag, setTag] = React.useState(ALL)
  const [query, setQuery] = React.useState("")
  const memoryVerses = useMemoryVerses()

  const shown = verses.filter(
    (verse) =>
      (tag === ALL || verse.tags.includes(tag)) &&
      matchesSearch(
        query,
        verse.reference,
        verse.version,
        verse.text,
        ...verse.tags
      )
  )
  const isSaved = (verse: ChurchVerse) =>
    memoryVerses.some(
      (saved) =>
        saved.reference === verse.reference && saved.version === verse.version
    )

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search church verses"
      />
      <FilterChips
        label="Filter by tag"
        options={[
          { value: ALL, label: "All" },
          ...tags.map((value) => ({ value, label: capitalize(value) })),
        ]}
        value={tag}
        onChange={setTag}
      />

      {shown.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No church verses match.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {shown.map((verse) => {
          const saved = isSaved(verse)
          return (
            <li key={verse.id}>
              <figure className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/8">
                <figcaption className="flex items-center gap-2">
                  <span className="font-semibold">{verse.reference}</span>
                  {verse.version && (
                    <span className="text-xs text-muted-foreground">
                      {verse.version}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ml-auto text-primary"
                    disabled={saved}
                    aria-label={
                      saved
                        ? `${verse.reference} is in your memory verses`
                        : `Add ${verse.reference} to memory verses`
                    }
                    onClick={() =>
                      addMemoryVerse({
                        reference: verse.reference,
                        version: verse.version,
                        text: verse.text,
                      })
                    }
                  >
                    {saved ? <BookmarkCheckIcon /> : <BookmarkPlusIcon />}
                  </Button>
                </figcaption>
                <blockquote className="font-serif text-[1.0625rem] leading-relaxed whitespace-pre-line">
                  {verse.text}
                </blockquote>
                <ul className="flex flex-wrap gap-1.5">
                  {verse.tags.map((value) => (
                    <li
                      key={value}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              </figure>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const ALL = "all"

const capitalize = (text: string) =>
  text.replace(/\b\w/g, (letter) => letter.toUpperCase())

export { VerseLibrary }
