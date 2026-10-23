import { BookOpenIcon } from "lucide-react"

import type { Block, Verse } from "@/lib/sermons"

function SermonContent({ blocks }: { blocks: Block[] }) {
  let pointNumber = 0

  return (
    <div className="flex flex-col gap-4">
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
        <p className="rounded-r-xl border-l-4 border-gold bg-accent/60 py-3 pr-4 pl-4 text-base font-medium whitespace-pre-line text-foreground">
          {block.text}
        </p>
      )
    case "text":
      return <p className="text-base leading-relaxed">{block.text}</p>
    case "declaration":
      return (
        <ul className="flex flex-col gap-1 rounded-2xl bg-hero px-4 py-5 text-center text-xl font-extrabold tracking-wide text-gold uppercase">
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )
    case "point":
      return (
        <section className="mt-8 flex flex-col gap-4">
          <h2 className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-base font-bold text-gold-foreground">
              {pointNumber}
            </span>
            <span className="flex flex-col">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Point {pointNumber}
              </span>
              <span className="text-xl leading-tight font-bold">
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
          <h2 className="text-xs font-semibold tracking-widest text-secondary-foreground uppercase">
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
    <figure className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/8">
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
            {v.text}{" "}
          </span>
        ))}
      </blockquote>
    </figure>
  )
}

export { SermonContent, VerseCard }
