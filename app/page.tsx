import Image from "next/image"
import Link from "next/link"
import {
  BrainIcon,
  BookOpenIcon,
  ChevronRightIcon,
  HeartIcon,
} from "lucide-react"
import { cn } from "cn"

import { ChurchLinks } from "@/components/church-links"
import { HeartCheckCount } from "@/components/heart-check-count"
import { HeartCheckDueCard } from "@/components/heart-check-due-card"
import { MemoryVerseCount } from "@/components/memory-verse-count"
import { SermonNoteQuote } from "@/components/sermon-note-quote"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpcomingEvents } from "@/components/upcoming-events"
import { getAllEvents } from "@/lib/events"
import { formatSermonDate, getAllSermons, getSermonNotes } from "@/lib/sermons"

export default function HomePage() {
  const sermons = getAllSermons()
  const latest = sermons.at(0)
  const events = getAllEvents()

  return (
    <>
      <header className="rounded-b-[2rem] bg-hero pt-[env(safe-area-inset-top)] text-hero-foreground">
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
              <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-gold-foreground">
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
              <p className="text-2xl leading-tight font-bold tracking-tight">
                {latest.title}
              </p>
            </div>
            <span className="flex h-11 items-center justify-center gap-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              Read sermon
              <ChevronRightIcon className="size-4" />
            </span>
          </Link>
        )}

        <Tabs defaultValue="dashboard" className="gap-6">
          <TabsList className="h-10! w-full">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h2 className="px-1 text-base font-bold tracking-tight">Grow</h2>
              <div className="flex flex-col divide-y divide-foreground/6 overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/6">
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

            <ChurchLinks />

            {latest && (
              <SermonNoteQuote
                notes={getSermonNotes(latest)}
                slug={latest.slug}
                title={latest.title}
              />
            )}
          </TabsContent>

          <TabsContent value="events">
            <UpcomingEvents events={events} />
          </TabsContent>
        </Tabs>
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
      className="flex items-center gap-3 p-4 transition-colors active:bg-muted"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-2xl",
          iconClassName
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm leading-tight font-semibold">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{detail}</span>
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
