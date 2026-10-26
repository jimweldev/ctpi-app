import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from "lucide-react"
import { cn } from "cn"

import { PageHeader } from "@/components/page-header"
import { SermonContent, VerseCard } from "@/components/sermon-content"
import { type SermonTab, SermonTabs } from "@/components/sermon-tabs"
import {
  formatSermonDate,
  getAllSermons,
  getSermon,
  getSermonParts,
  getSeriesNeighbors,
  type SermonEntry,
} from "@/lib/sermons"

export const dynamicParams = false

export function generateStaticParams() {
  return getAllSermons().map((sermon) => ({ slug: sermon.slug }))
}

export async function generateMetadata(
  props: PageProps<"/sermons/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params
  const sermon = getSermon(slug)
  return sermon ? { title: sermon.title } : {}
}

export default async function SermonPage(props: PageProps<"/sermons/[slug]">) {
  const { slug } = await props.params
  const sermon = getSermon(slug)
  if (!sermon) notFound()

  const { seriesInfo } = sermon
  const { previous, next } = getSeriesNeighbors(sermon)

  const { intro, points } = getSermonParts(sermon.content)
  const tabs: SermonTab[] = points.map((blocks, index) => ({
    value: `point-${index + 1}`,
    label: `Point ${index + 1}`,
    title: blocks[0]?.type === "point" ? blocks[0].title : undefined,
    content: (
      <SermonContent
        blocks={blocks}
        pointsBefore={index}
        className="[&>section:first-child]:mt-0"
      />
    ),
  }))
  if (sermon.outro?.length) {
    tabs.push({
      value: "outro",
      label: "Outro",
      title: "Closing",
      content: <SermonContent blocks={sermon.outro} />,
    })
  }
  if (seriesInfo?.scripture || intro.length > 0) {
    tabs.unshift({
      value: "intro",
      label: "Intro",
      content: (
        <>
          {seriesInfo?.scripture && <VerseCard verse={seriesInfo.scripture} />}
          <SermonContent blocks={intro} />
        </>
      ),
    })
  }

  return (
    <>
      <PageHeader
        title={sermon.title}
        back={{ href: "/sermons", label: "Sermons" }}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-4">
        <header className="flex flex-col gap-4 rounded-3xl bg-hero p-6 text-hero-foreground">
          {seriesInfo && (
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold text-gold">
                {seriesInfo.title}
              </p>
              <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                Part {seriesInfo.part}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance">
              {sermon.title}
            </h2>
            {sermon.subtitle && (
              <p className="font-serif text-lg italic opacity-90">
                {sermon.subtitle}
              </p>
            )}
            {seriesInfo?.subtitle && (
              <p className="text-sm opacity-75">{seriesInfo.subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-hero-foreground/15 pt-4 text-sm opacity-80">
            {sermon.speaker && (
              <span className="flex items-center gap-1.5">
                <UserIcon className="size-4" />
                {sermon.speaker}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-4" />
              {formatSermonDate(sermon.date)}
            </span>
          </div>
        </header>

        <SermonTabs tabs={tabs} />

        {(previous || next) && (
          <nav className="mt-4 grid grid-cols-2 gap-3">
            {previous && <SeriesLink sermon={previous} direction="previous" />}
            {next && <SeriesLink sermon={next} direction="next" />}
          </nav>
        )}
      </main>
    </>
  )
}

function SeriesLink({
  sermon,
  direction,
}: {
  sermon: SermonEntry
  direction: "previous" | "next"
}) {
  const isNext = direction === "next"
  const Icon = isNext ? ChevronRightIcon : ChevronLeftIcon

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className={cn(
        "flex items-center gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/6 transition-transform active:scale-[0.98]",
        isNext && "col-start-2 flex-row-reverse text-right"
      )}
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          Part {sermon.seriesInfo?.part}
        </span>
        <span className="text-sm font-semibold">{sermon.title}</span>
      </div>
    </Link>
  )
}
