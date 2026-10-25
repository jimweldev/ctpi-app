"use client"

import Link from "next/link"
import { ChevronRightIcon, HeartIcon } from "lucide-react"

import { useHeartCheckDue } from "@/lib/heart-check-due"

/** Home card shown while a scheduled heart check hasn't been done yet. */
function HeartCheckDueCard() {
  const due = useHeartCheckDue()
  if (!due) return null

  return (
    <Link
      href="/heart-check"
      className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-lg ring-2 ring-brand-red/40 transition-transform active:scale-[0.98]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-red/12 text-brand-red">
        <HeartIcon className="size-6" fill="currentColor" fillOpacity={0.15} />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="font-semibold">
          It&apos;s time for your heart check
        </span>
        <span className="text-sm text-muted-foreground">
          Take a moment to check where your heart is today.
        </span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}

export { HeartCheckDueCard }
