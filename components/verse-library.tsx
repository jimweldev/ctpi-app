"use client"

import * as React from "react"
import { BookmarkCheckIcon, BookmarkPlusIcon } from "lucide-react"
import { cn } from "cn"

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
  const [tag, setTag] = React.useState<string | null>(null)
  const memoryVerses = useMemoryVerses()

  const shown = tag
    ? verses.filter((verse) => verse.tags.includes(tag))
    : verses
  const isSaved = (verse: ChurchVerse) =>
    memoryVerses.some(
      (saved) =>
        saved.reference === verse.reference && saved.version === verse.version
    )

  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Filter by tag"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        <TagChip selected={tag === null} onClick={() => setTag(null)}>
          All
        </TagChip>
        {tags.map((value) => (
          <TagChip
            key={value}
            selected={tag === value}
            onClick={() => setTag(value)}
          >
            {value}
          </TagChip>
        ))}
      </div>

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

function TagChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full bg-muted px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground capitalize transition-colors",
        selected && "bg-primary text-primary-foreground"
      )}
    >
      {children}
    </button>
  )
}

export { VerseLibrary }
