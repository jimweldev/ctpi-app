import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { getAllSermons } from "@/lib/sermons"

export const metadata: Metadata = {
  title: "Sermons",
}

export default function SermonsPage() {
  const sermons = getAllSermons()

  return (
    <>
      <PageHeader title="Sermons" />
      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        <ul className="flex flex-col gap-2.5">
          {sermons.map((sermon) => {
            const date = new Date(`${sermon.date}T00:00:00`)
            return (
              <li key={sermon.slug}>
                <Link
                  href={`/sermons/${sermon.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-card p-3 pr-4 ring-1 ring-foreground/8 transition-transform active:scale-[0.98]"
                >
                  <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <span className="text-[0.625rem] font-bold tracking-wider uppercase">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl leading-none font-bold">
                      {date.getDate()}
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {sermon.seriesInfo && (
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {sermon.seriesInfo.title}
                        <span className="text-brand-red">
                          {" "}
                          · Part {sermon.seriesInfo.part}
                        </span>
                      </span>
                    )}
                    <span className="leading-snug font-semibold">
                      {sermon.title}
                    </span>
                  </span>
                  <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
