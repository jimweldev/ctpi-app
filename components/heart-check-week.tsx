"use client"

import { ClockIcon, HeartIcon } from "lucide-react"
import { cn } from "cn"

import { type DayStatus, useHeartCheckWeek } from "@/lib/heart-check-due"
import { formatDay } from "@/lib/heart-check-schedules"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

const STATUS_LABELS: Record<DayStatus, string> = {
  done: "done",
  missed: "missed",
  due: "due now",
  later: "scheduled later today",
  none: "nothing scheduled",
}

/**
 * The last 7 days at a glance: which scheduled heart checks were done or
 * missed. Missed days (and today, once due) open the form for that date.
 */
function HeartCheckWeek({ onAdd }: { onAdd: (date: string) => void }) {
  const week = useHeartCheckWeek()
  if (!week?.scheduled) return null

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-xs ring-1 ring-foreground/8">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold">This week</h2>
        <p
          className={cn(
            "text-xs",
            week.missed > 0
              ? "font-medium text-brand-red"
              : "text-muted-foreground"
          )}
        >
          {week.missed > 0 ? `${week.missed} missed` : "No missed checks"}
        </p>
      </div>

      <ol className="grid grid-cols-7 gap-1">
        {week.days.map(({ date, status }, index) => {
          const day = new Date(`${date}T00:00`)
          const today = index === week.days.length - 1
          const label = `${formatDay(date)}, ${STATUS_LABELS[status]}`
          const content = (
            <>
              <span
                className={cn(
                  "text-[0.6875rem] font-medium text-muted-foreground",
                  today && "text-foreground"
                )}
              >
                {today ? "Today" : WEEKDAYS[day.getDay()]}
              </span>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                  status === "done" && "bg-brand-red/12 text-brand-red",
                  status === "missed" &&
                    "border-2 border-dashed border-brand-red text-brand-red",
                  status === "due" && "bg-brand-red text-white",
                  status === "later" && "bg-muted text-muted-foreground",
                  status === "none" && "text-muted-foreground/60"
                )}
              >
                {status === "done" ? (
                  <HeartIcon className="size-4 fill-current" aria-hidden />
                ) : status === "later" ? (
                  <ClockIcon className="size-4" aria-hidden />
                ) : (
                  day.getDate()
                )}
              </span>
            </>
          )
          const tappable = status === "missed" || status === "due"

          return (
            <li key={date} className="flex justify-center">
              {tappable ? (
                <button
                  type="button"
                  aria-label={`${label}. Add heart check`}
                  onClick={() => onAdd(date)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl px-1 py-1 transition-transform active:scale-95"
                >
                  {content}
                </button>
              ) : (
                <span
                  aria-label={label}
                  className="flex flex-col items-center gap-1.5 px-1 py-1"
                >
                  {content}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {week.missed > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          Tap a missed day to add its heart check.
        </p>
      )}
    </section>
  )
}

export { HeartCheckWeek }
