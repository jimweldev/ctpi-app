"use client"

import * as React from "react"
import Link from "next/link"
import { ShuffleIcon } from "lucide-react"

// Picked once per page load, so the note stays put while the app is open.
const seed = Math.random()
const subscribe = () => () => {}

/**
 * A random note from a sermon, as a quote card. Home is prerendered, so the
 * server shows the first note and the client swaps in a random one.
 */
function SermonNoteQuote({
  notes,
  slug,
  title,
}: {
  notes: string[]
  slug: string
  title: string
}) {
  const initial = React.useSyncExternalStore(
    subscribe,
    () => Math.floor(seed * notes.length),
    () => 0
  )
  const [picked, setPicked] = React.useState<number | null>(null)
  const index = picked ?? initial

  if (notes.length === 0) return null

  function shuffle() {
    const next = Math.floor(Math.random() * (notes.length - 1))
    setPicked(next >= index ? next + 1 : next)
  }

  return (
    <figure className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-hero p-6 pt-10 text-hero-foreground">
      <span
        aria-hidden
        className="absolute top-0 left-4 font-serif text-8xl leading-none text-gold/70"
      >
        &ldquo;
      </span>
      {notes.length > 1 && (
        <button
          type="button"
          onClick={shuffle}
          aria-label="Show another note"
          className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full text-hero-foreground/70 transition-colors hover:bg-hero-foreground/10 hover:text-hero-foreground active:scale-95"
        >
          <ShuffleIcon className="size-4" />
        </button>
      )}
      <blockquote className="relative font-serif text-xl leading-snug whitespace-pre-line italic">
        {notes[index]}
      </blockquote>
      <figcaption className="text-xs font-medium text-gold">
        <Link href={`/sermons/${slug}`} className="hover:underline">
          From &ldquo;{title}&rdquo;
        </Link>
      </figcaption>
    </figure>
  )
}

export { SermonNoteQuote }
