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
        <div className="flex flex-col gap-3 rounded-r-xl border-l-4 border-gold bg-accent/60 py-3 pr-4 pl-4 text-base font-medium text-foreground">
          <FormattedText text={block.text} />
        </div>
      )
    case "point":
      return (
        <section className="mt-8 flex flex-col gap-4">
          <h2 className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-base font-bold text-gold-foreground">
              {pointNumber}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Point {pointNumber}
              </span>
              <span className="text-xl leading-tight font-bold tracking-tight">
                {block.title}
              </span>
            </span>
          </h2>
          <SermonContent blocks={block.content} />
        </section>
      )
    case "section":
      return (
        <section className="mt-8 flex flex-col gap-4 rounded-3xl bg-secondary p-5">
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
    <figure className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/6">
      <figcaption className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-primary">
          <BookOpenIcon className="size-3.5" />
        </span>
        <span className="font-semibold">{verse.reference}</span>
        {verse.version && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-muted-foreground">
            {verse.version}
          </span>
        )}
      </figcaption>
      <blockquote className="font-serif text-[1.0625rem] leading-relaxed whitespace-pre-line">
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
