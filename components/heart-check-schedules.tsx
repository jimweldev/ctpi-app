"use client"

import * as React from "react"
import {
  CalendarClockIcon,
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "cn"

import { ConfirmDelete } from "@/components/confirm-delete"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Switch } from "@/components/ui/switch"
import { TimeWheelPicker } from "@/components/wheel-picker"
import {
  addHeartCheckSchedule,
  formatDay,
  formatTime,
  type HeartCheckSchedule,
  nextOccurrence,
  removeHeartCheckSchedule,
  toDateKey,
  updateHeartCheckSchedule,
  useHeartCheckSchedules,
  useNow,
} from "@/lib/heart-check-schedules"

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function HeartCheckScheduleList() {
  const schedules = useHeartCheckSchedules()
  const now = useNow()
  const [editorOpen, setEditorOpen] = React.useState(false)
  // Changing the key remounts the editor with fresh state for each open.
  const [editor, setEditor] = React.useState<{
    key: number
    schedule?: HeartCheckSchedule
    defaultTime: string
  }>({ key: 0, defaultTime: "06:00" })

  function openEditor(schedule?: HeartCheckSchedule) {
    // New schedules default to the next full hour, like a phone alarm.
    const nextHour = (new Date().getHours() + 1) % 24
    setEditor((current) => ({
      key: current.key + 1,
      schedule,
      defaultTime: `${String(nextHour).padStart(2, "0")}:00`,
    }))
    setEditorOpen(true)
  }

  const sorted = [...schedules].sort((a, b) => a.time.localeCompare(b.time))
  const next =
    now === null
      ? null
      : schedules
          .map((schedule) => nextOccurrence(schedule, now))
          .filter((date) => date !== null)
          .sort((a, b) => a.getTime() - b.getTime())
          .at(0)

  return (
    <>
      <PageHeader
        title="Schedule"
        back={{ href: "/heart-check", label: "Heart Check" }}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add schedule"
            onClick={() => openEditor()}
          >
            <PlusIcon className="size-6 text-primary" />
          </Button>
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4">
        {schedules.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>No schedules yet</EmptyTitle>
              <EmptyDescription>
                Set a time to be reminded to do your heart check.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => openEditor()}>
              <PlusIcon />
              Add schedule
            </Button>
          </Empty>
        ) : (
          <>
            <p className="px-1 pt-2 pb-4 text-center text-xl font-semibold">
              {next && now !== null
                ? `Heart check ${formatUntil(next.getTime() - now)}`
                : "All schedules are off"}
            </p>
            {sorted.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={() => openEditor(schedule)}
              />
            ))}
          </>
        )}
      </main>
      <Drawer open={editorOpen} onOpenChange={setEditorOpen} showSwipeHandle>
        <DrawerContent>
          <ScheduleEditor
            key={editor.key}
            schedule={editor.schedule}
            defaultTime={editor.defaultTime}
            now={now}
            onDone={() => setEditorOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

function ScheduleCard({
  schedule,
  onEdit,
}: {
  schedule: HeartCheckSchedule
  onEdit: () => void
}) {
  const { clock, period } = formatTime(schedule.time)

  return (
    <article className="flex items-center gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/6">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${clock} ${period} schedule`}
        className={cn(
          "flex flex-1 items-baseline gap-1.5 text-left transition-opacity active:opacity-60",
          !schedule.enabled && "opacity-45"
        )}
      >
        <span className="text-sm font-medium">{period}</span>
        <span className="text-4xl leading-none font-light tabular-nums">
          {clock}
        </span>
      </button>
      <RepeatSummary
        schedule={schedule}
        className={cn(!schedule.enabled && "opacity-45")}
      />
      <Switch
        checked={schedule.enabled}
        onCheckedChange={(enabled) =>
          updateHeartCheckSchedule(schedule.id, { enabled })
        }
        aria-label={schedule.enabled ? "Turn off" : "Turn on"}
        className="ml-1"
      />
    </article>
  )
}

/** Weekday letters for a repeating schedule, or the date of a one-time one. */
function RepeatSummary({
  schedule,
  className,
}: {
  schedule: HeartCheckSchedule
  className?: string
}) {
  if (schedule.days.length === 0) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {schedule.date ? formatDay(schedule.date) : null}
      </span>
    )
  }

  return (
    <span
      aria-label={`Repeats every ${formatRepeat(schedule.days)}`}
      className={cn("flex gap-0.5 text-[0.6875rem] font-medium", className)}
    >
      {WEEKDAYS.map((letter, day) => (
        <span
          key={day}
          aria-hidden
          className={cn(
            "w-2.5 text-center text-muted-foreground/40",
            schedule.days.includes(day) &&
              (day === 0 ? "text-brand-red" : "text-primary dark:text-gold")
          )}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}

/** Schedule editor, set like a Samsung alarm: time wheels, then a date or repeat days. */
function ScheduleEditor({
  schedule,
  defaultTime,
  now,
  onDone,
}: {
  schedule?: HeartCheckSchedule
  defaultTime: string
  now: number | null
  onDone: () => void
}) {
  const [time, setTime] = React.useState(schedule?.time ?? defaultTime)
  const [days, setDays] = React.useState(schedule?.days ?? [])
  // A one-time schedule without a picked date is due the next time it can.
  const [date, setDate] = React.useState<string | null>(schedule?.date ?? null)
  const dateInput = React.useRef<HTMLInputElement>(null)

  const today = now === null ? null : toDateKey(new Date(now))
  const effectiveDate = date ?? (now === null ? null : autoDate(time, now))

  function toggleDay(day: number) {
    setDate(null)
    setDays((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort()
    )
  }

  function save() {
    const input = {
      time,
      days,
      date: days.length > 0 ? undefined : (date ?? autoDate(time, Date.now())),
    }
    if (schedule)
      updateHeartCheckSchedule(schedule.id, { ...input, enabled: true })
    else addHeartCheckSchedule(input)
    onDone()
  }

  return (
    <div className="flex min-h-0 flex-col">
      <DrawerHeader className="sr-only">
        <DrawerTitle>{schedule ? "Edit schedule" : "Add schedule"}</DrawerTitle>
      </DrawerHeader>
      <div className="flex flex-col gap-5 overflow-y-auto p-4">
        <TimeWheelPicker value={time} onChange={setTime} />

        <div className="flex flex-col gap-4 rounded-3xl bg-muted/60 p-4">
          <div className="relative flex items-center gap-2">
            <span className="flex-1 text-sm font-medium">
              {days.length > 0
                ? `Every ${formatRepeat(days)}`
                : effectiveDate && today
                  ? describeDate(effectiveDate, today)
                  : null}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pick a date"
              onClick={() => dateInput.current?.showPicker()}
            >
              <CalendarIcon className="size-5" />
            </Button>
            <input
              ref={dateInput}
              type="date"
              tabIndex={-1}
              aria-hidden
              min={today ?? undefined}
              value={effectiveDate ?? ""}
              onChange={(event) => {
                if (!event.target.value) return
                setDate(event.target.value)
                setDays([])
              }}
              className="pointer-events-none absolute size-0 opacity-0"
            />
          </div>

          <div
            role="group"
            aria-label="Repeat on"
            className="flex justify-between"
          >
            {WEEKDAYS.map((letter, day) => {
              const selected = days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={selected}
                  aria-label={WEEKDAY_NAMES[day]}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    day === 0 ? "text-brand-red" : "text-foreground",
                    selected &&
                      "bg-primary text-primary-foreground dark:bg-gold dark:text-gold-foreground"
                  )}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <DrawerFooter className={cn(schedule && "grid grid-cols-2")}>
        {schedule && (
          <ConfirmDelete
            title="Delete this schedule?"
            description="You won't be reminded at this time anymore. This can't be undone."
            onConfirm={() => {
              removeHeartCheckSchedule(schedule.id)
              onDone()
            }}
          >
            <Button variant="secondary" size="lg" className="text-destructive">
              <Trash2Icon />
              Delete
            </Button>
          </ConfirmDelete>
        )}
        <Button size="lg" onClick={save}>
          Save
        </Button>
      </DrawerFooter>
    </div>
  )
}

/** Today if `time` is still ahead, otherwise tomorrow. */
function autoDate(time: string, now: number) {
  const today = new Date(now)
  const due = new Date(`${toDateKey(today)}T${time}`)
  if (due.getTime() > now) return toDateKey(today)
  return toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  )
}

function describeDate(dateKey: string, todayKey: string) {
  const today = new Date(`${todayKey}T00:00`)
  const tomorrow = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  )
  const prefix =
    dateKey === todayKey
      ? "Today – "
      : dateKey === tomorrow
        ? "Tomorrow – "
        : ""
  return prefix + formatDay(dateKey)
}

function formatRepeat(days: number[]) {
  if (days.length === 7) return "day"
  if (days.join() === "1,2,3,4,5") return "weekday"
  if (days.join() === "0,6") return "weekend"
  return days.map((day) => WEEKDAY_NAMES[day]).join(", ")
}

function formatUntil(ms: number) {
  const totalMinutes = Math.ceil(ms / 60_000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const parts = [
    days && `${days} ${days === 1 ? "day" : "days"}`,
    hours && `${hours} hr`,
    !days && minutes && `${minutes} min`,
  ].filter(Boolean)
  return parts.length > 0 ? `in ${parts.join(" ")}` : "in less than a minute"
}

export { HeartCheckScheduleList }
