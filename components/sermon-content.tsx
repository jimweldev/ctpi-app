import { BookOpenIcon } from "lucide-react"
import { cn } from "cn"

import { FormattedText, InlineText } from "@/components/formatted-text"
import type { Block, Verse } from "@/lib/sermons"

function SermonContent({
  blocks,
  pointsBefore = 0,
  className,
}: {
  blocks: Block[]
  /** Points that came earlier in the sermon, so numbering continues. */
  pointsBefore?: number
  className?: string
}) {
  let pointNumber = pointsBefore

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {blocks.map((block, index) => {
        if (block.type === "point") pointNumber++
        return (
          <SermonBlock key={index} block={block} pointNumber={pointNumber} />
        )
      })}
    </div>
  )
}

function SermonBlock({
  block,
  pointNumber,
}: {
  block: Block
  pointNumber: number
}) {
  switch (block.type) {
    case "verse":
      return <VerseCard verse={block} />
    case "note":
      return (
        <div className="flex flex-col gap-3 text-[1.0625rem] leading-relaxed text-foreground">
          <FormattedText text={block.text} />
        </div>
      )
    case "point":
      return (
        <section className="mt-8 flex flex-col gap-5">
          <h2 className="flex flex-col gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gold text-xl font-bold text-gold-foreground">
              {pointNumber}
            </span>
            <span className="text-2xl leading-tight font-bold tracking-tight text-balance">
              <span className="sr-only">Point {pointNumber}: </span>
              {block.title}
            </span>
          </h2>
          <SermonContent blocks={block.content} />
        </section>
      )
    case "section":
      return (
        <section className="mt-6 flex flex-col gap-4 rounded-3xl bg-secondary/70 p-5">
          <h2 className="text-base font-bold tracking-tight text-secondary-foreground">
            {block.title}
          </h2>
          <SermonContent blocks={block.content} />
        </section>
      )
  }
}

function VerseCard({ verse }: { verse: Omit<Verse, "type"> }) {
  const showNumbers = verse.verses.length > 1

  return (
    <figure className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-card p-5 pl-6 ring-1 ring-foreground/6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gold">
      <figcaption className="flex items-center gap-2">
        <BookOpenIcon className="size-4 text-gold-text" />
        <span className="text-sm font-semibold">{verse.reference}</span>
        {verse.version && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
            {verse.version}
          </span>
        )}
      </figcaption>
      <blockquote className="font-serif text-lg leading-relaxed whitespace-pre-line">
        {verse.verses.map((v) => (
          <span key={v.number}>
            {showNumbers && (
              <sup className="mr-1 font-sans text-[0.6875rem] font-bold text-brand-red">
                {v.number}
              </sup>
            )}
            <InlineText text={v.text} />{" "}
          </span>
        ))}
      </blockquote>
    </figure>
  )
}

export { SermonContent, VerseCard }
