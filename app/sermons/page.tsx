import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import {
  SermonList,
  type SermonListItem,
  type SermonListSeries,
} from "@/components/sermon-list"
import { getAllSeries, getAllSermons, getSermonSearchText } from "@/lib/sermons"

export const metadata: Metadata = {
  title: "Sermons",
}

export default function SermonsPage() {
  const sermons: SermonListItem[] = getAllSermons().map((sermon) => ({
    slug: sermon.slug,
    title: sermon.title,
    subtitle: sermon.subtitle,
    date: sermon.date,
    series: sermon.seriesInfo && {
      slug: sermon.seriesInfo.slug,
      title: sermon.seriesInfo.title,
      part: sermon.seriesInfo.part,
    },
    searchText: getSermonSearchText(sermon),
  }))
  const series: SermonListSeries[] = getAllSeries().map(
    ({ slug, title, subtitle }) => ({ slug, title, subtitle })
  )

  return (
    <>
      <PageHeader title="Sermons" />
      <main className="mx-auto w-full max-w-2xl px-4 py-4">
        <SermonList sermons={sermons} series={series} />
      </main>
    </>
  )
}
