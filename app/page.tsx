import Image from "next/image"
import Link from "next/link"
import {
  BrainIcon,
  BookOpenIcon,
  ChevronRightIcon,
  HeartIcon,
} from "lucide-react"

import { HeartCheckCount } from "@/components/heart-check-count"
import { MemoryVerseCount } from "@/components/memory-verse-count"
import { UpcomingEvents } from "@/components/upcoming-events"
import { getAllEvents } from "@/lib/events"
import { formatSermonDate, getAllSermons } from "@/lib/sermons"

export default function HomePage() {
  const sermons = getAllSermons()
  const latest = sermons.at(0)

  return (
    <>
      <header className="bg-hero pt-[env(safe-area-inset-top)] text-hero-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 pt-6 pb-16 text-center">
          <h1>
            <Image
              src="/logo-wide.png"
              alt="Calvary Temple Philippines"
              width={949}
              height={560}
              priority
              className="h-auto w-52 rounded-3xl shadow-lg ring-2 ring-gold/60"
            />
          </h1>
          <p className="max-w-xs font-serif text-sm italic opacity-85">
            A church that has passion for God and compassion for man.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-10 flex w-full max-w-2xl flex-col gap-6 px-4 pb-6">
        {latest && (
          <Link
            href={`/sermons/${latest.slug}`}
            className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-lg ring-1 ring-foreground/8 transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-gold px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gold-foreground uppercase">
                Latest sermon
              </span>
              <span className="text-xs text-muted-foreground">
                {formatSermonDate(latest.date)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {latest.seriesInfo && (
                <p className="text-sm font-medium text-muted-foreground">
                  {latest.seriesInfo.title} · Part {latest.seriesInfo.part} of{" "}
                  {latest.seriesInfo.total}
                </p>
              )}
              <p className="text-2xl leading-tight font-bold">{latest.title}</p>
            </div>
            <span className="flex h-11 items-center justify-center gap-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              Read sermon
              <ChevronRightIcon className="size-4" />
            </span>
          </Link>
        )}

        <UpcomingEvents events={getAllEvents()} />

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/sermons"
            className="flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/8 transition-transform active:scale-[0.97]"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
              <BookOpenIcon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold">Sermons</span>
              <span className="text-xs text-muted-foreground">
                {sermons.length} messages
              </span>
            </span>
          </Link>
          <Link
            href="/memory-verses"
            className="flex flex-col gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/8 transition-transform active:scale-[0.97]"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <BrainIcon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold">Memory Verses</span>
              <MemoryVerseCount />
            </span>
          </Link>
          <Link
            href="/heart-check"
            className="col-span-2 flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/8 transition-transform active:scale-[0.97]"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-red/12 text-brand-red">
              <HeartIcon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold">Heart Check</span>
              <HeartCheckCount />
            </span>
          </Link>
        </div>

        <figure className="flex flex-col gap-2 rounded-3xl bg-secondary p-5">
          <blockquote className="font-serif text-lg leading-snug text-secondary-foreground italic">
            &ldquo;A memorized verse today is a victory tomorrow.&rdquo;
          </blockquote>
          <figcaption className="text-xs font-medium text-muted-foreground">
            From &ldquo;Prepare your weapon&rdquo;
          </figcaption>
        </figure>
      </main>
    </>
  )
}
