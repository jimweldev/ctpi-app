import Image from "next/image"
import Link from "next/link"
import {
  BrainIcon,
  BookOpenIcon,
  ChevronRightIcon,
  HeartIcon,
} from "lucide-react"
import { cn } from "cn"

import { HeartCheckCount } from "@/components/heart-check-count"
import { HeartCheckDueCard } from "@/components/heart-check-due-card"
import { MemoryVerseCount } from "@/components/memory-verse-count"
import { UpcomingEvents } from "@/components/upcoming-events"
import { getAllEvents } from "@/lib/events"
import { formatSermonDate, getAllSermons } from "@/lib/sermons"

export default function HomePage() {
  const sermons = getAllSermons()
  const latest = sermons.at(0)
  const events = getAllEvents()

  return (
    <>
      <header className="bg-hero pt-[env(safe-area-inset-top)] text-hero-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-5 pt-5 pb-16 text-center">
          <h1>
            <Image
              src="/logo-wide.png"
              alt="Calvary Temple Philippines"
              width={949}
              height={560}
              priority
              className="h-auto w-44 rounded-3xl shadow-lg ring-2 ring-gold/60"
            />
          </h1>
          <p className="max-w-xs font-serif text-sm italic opacity-85">
            A church that has passion for God and compassion for man.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-10 flex w-full max-w-2xl flex-col gap-6 px-4 pb-6">
        <HeartCheckDueCard />

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
                  {latest.seriesInfo.title}
                  <span className="text-brand-red">
                    {" "}
                    · Part {latest.seriesInfo.part}
                  </span>
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

        <UpcomingEvents events={events} />

        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Grow
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickLink
              href="/sermons"
              icon={<BookOpenIcon className="size-5" />}
              iconClassName="bg-secondary text-primary"
              title="Sermons"
              detail={`${sermons.length} messages`}
            />
            <QuickLink
              href="/memory-verses"
              icon={<BrainIcon className="size-5" />}
              iconClassName="bg-accent text-accent-foreground"
              title="Memory Verses"
              detail={<MemoryVerseCount />}
            />
            <QuickLink
              href="/heart-check"
              icon={<HeartIcon className="size-5" />}
              iconClassName="bg-brand-red/12 text-brand-red"
              title="Heart Check"
              detail={<HeartCheckCount />}
            />
          </div>
        </section>

        <figure className="relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-hero p-6 pt-10 text-hero-foreground">
          <span
            aria-hidden
            className="absolute top-0 left-4 font-serif text-8xl leading-none text-gold/70"
          >
            &ldquo;
          </span>
          <blockquote className="relative font-serif text-xl leading-snug italic">
            A memorized verse today is a victory tomorrow.
          </blockquote>
          <figcaption className="text-xs font-medium text-gold">
            From &ldquo;Prepare your weapon&rdquo;
          </figcaption>
        </figure>
      </main>
    </>
  )
}

function QuickLink({
  href,
  icon,
  iconClassName,
  title,
  detail,
}: {
  href: string
  icon: React.ReactNode
  iconClassName: string
  title: string
  detail: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-3xl bg-card p-3.5 ring-1 ring-foreground/8 transition-transform active:scale-[0.97]"
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-2xl",
          iconClassName
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </span>
    </Link>
  )
}
