"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarClockIcon,
  ChevronRightIcon,
  HeartIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "cn"

import { ConfirmDelete } from "@/components/confirm-delete"
import { FilterChips } from "@/components/filter-chips"
import { HeartCheckDueCard } from "@/components/heart-check-due-card"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDay, toDateKey, useNow } from "@/lib/heart-check-schedules"
import {
  addHeartCheck,
  getHeartLevel,
  HEART_LEVELS,
  type HeartCheck,
  type HeartLevel,
  removeHeartCheck,
  updateHeartCheck,
  useHeartChecks,
} from "@/lib/heart-checks"

type DateRange = "7d" | "1m" | "3m" | "all" | "custom"

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom" },
]

function monthsBefore(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() - months, date.getDate())
}

/** First "YYYY-MM-DD" included in a preset range, or "" for all time. */
function rangeStart(range: Exclude<DateRange, "custom">, today: Date) {
  switch (range) {
    case "7d":
      return toDateKey(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
      )
    case "1m":
      return toDateKey(monthsBefore(today, 1))
    case "3m":
      return toDateKey(monthsBefore(today, 3))
    case "all":
      return ""
  }
}

function HeartCheckList() {
  const checks = useHeartChecks()
  const now = useNow()
  const [adding, setAdding] = React.useState(false)
  // Changing the key resets the form for each open.
  const [form, setForm] = React.useState<{
    key: number
    today: string
    check?: HeartCheck
  }>({ key: 0, today: "" })
  const [viewing, setViewing] = React.useState<HeartCheck | null>(null)
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateRange>("1m")
  const [custom, setCustom] = React.useState({ from: "", to: "" })

  /** Open the form to add a heart check, or to edit `check`. */
  function openForm(check?: HeartCheck) {
    setForm((current) => ({
      key: current.key + 1,
      today: toDateKey(new Date()),
      check,
    }))
    setAdding(true)
  }

  const { from, to } =
    range === "custom"
      ? custom
      : { from: now === null ? "" : rangeStart(range, new Date(now)), to: "" }
  const shown = checks.filter(
    (check) => (!from || check.date >= from) && (!to || check.date <= to)
  )

  return (
    <>
      <PageHeader
        title="Heart Check"
        action={
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Schedule"
              nativeButton={false}
              render={<Link href="/heart-check/schedule" />}
            >
              <CalendarClockIcon className="size-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add heart check"
              onClick={() => openForm()}
            >
              <PlusIcon className="size-6 text-primary" />
            </Button>
          </div>
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4">
        <HeartCheckDueCard onOpen={() => openForm()} />

        {checks.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartIcon />
              </EmptyMedia>
              <EmptyTitle>No heart checks yet</EmptyTitle>
              <EmptyDescription>
                Pause and examine your heart before God. It stays on this
                device.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-col gap-2">
              <Button onClick={() => openForm()}>
                <PlusIcon />
                Add heart check
              </Button>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/heart-check/schedule" />}
              >
                <CalendarClockIcon />
                Set a schedule
              </Button>
            </div>
          </Empty>
        ) : (
          <>
            <FilterChips
              label="Date range"
              options={DATE_RANGES}
              value={range}
              onChange={(next) => {
                if (next === "custom" && !custom.from) {
                  const today = new Date()
                  setCustom({
                    from: toDateKey(monthsBefore(today, 1)),
                    to: toDateKey(today),
                  })
                }
                setRange(next)
              }}
            />
            {range === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  From
                  <Input
                    type="date"
                    value={custom.from}
                    max={custom.to || undefined}
                    onChange={(event) =>
                      setCustom({ ...custom, from: event.target.value })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  To
                  <Input
                    type="date"
                    value={custom.to}
                    min={custom.from || undefined}
                    onChange={(event) =>
                      setCustom({ ...custom, to: event.target.value })
                    }
                  />
                </label>
              </div>
            )}
            <p className="px-1 text-xs text-muted-foreground">
              Showing {shown.length} of {checks.length} heart{" "}
              {checks.length === 1 ? "check" : "checks"}
            </p>
            {shown.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
                No heart checks in this date range.
                <Button variant="secondary" onClick={() => setRange("all")}>
                  Show all
                </Button>
              </div>
            ) : (
              shown.map((check) => (
                <HeartCheckCard
                  key={check.id}
                  check={check}
                  onOpen={() => {
                    setViewing(check)
                    setViewerOpen(true)
                  }}
                />
              ))
            )}
          </>
        )}
      </main>
      <Drawer open={viewerOpen} onOpenChange={setViewerOpen} showSwipeHandle>
        <DrawerContent>
          {/* Kept after closing so the drawer animates out with its content. */}
          {viewing && (
            <HeartCheckDetails
              check={viewing}
              onEdit={() => {
                setViewerOpen(false)
                openForm(viewing)
              }}
              onDone={() => setViewerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
      <Drawer open={adding} onOpenChange={setAdding} showSwipeHandle>
        <DrawerContent>
          <HeartCheckForm
            key={form.key}
            today={form.today}
            check={form.check}
            onDone={() => setAdding(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

function HeartCheckCard({
  check,
  onOpen,
}: {
  check: HeartCheck
  onOpen: () => void
}) {
  const { label } = getHeartLevel(check.level)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-3 rounded-2xl bg-card p-5 text-left shadow-xs ring-1 ring-foreground/8 transition-transform active:scale-[0.98]"
    >
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <Hearts level={check.level} />
          <span className="font-semibold">{label}</span>
        </span>
        <time dateTime={check.date} className="text-xs text-muted-foreground">
          {formatDay(check.date)}
        </time>
      </span>
      <ChevronRightIcon className="size-5 text-muted-foreground" />
    </button>
  )
}

function HeartCheckDetails({
  check,
  onEdit,
  onDone,
}: {
  check: HeartCheck
  onEdit: () => void
  onDone: () => void
}) {
  const { label, description } = getHeartLevel(check.level)

  return (
    <div className="flex min-h-0 flex-col">
      <DrawerHeader>
        <Hearts level={check.level} className="[&>svg]:size-6" />
        <DrawerTitle>{label}</DrawerTitle>
        <DrawerDescription>
          {formatDay(check.date)} · {description}
        </DrawerDescription>
      </DrawerHeader>
      <div className="overflow-y-auto px-4 py-2">
        <p
          className={cn(
            "leading-relaxed whitespace-pre-line",
            !check.details && "text-muted-foreground italic"
          )}
        >
          {check.details ?? "No details"}
        </p>
      </div>
      <DrawerFooter className="grid grid-cols-2">
        <ConfirmDelete
          title="Delete this heart check?"
          description={`Your check from ${formatDay(check.date)} will be removed. This can't be undone.`}
          onConfirm={() => {
            removeHeartCheck(check.id)
            onDone()
          }}
        >
          <Button variant="secondary" size="lg" className="text-destructive">
            <Trash2Icon />
            Delete
          </Button>
        </ConfirmDelete>
        <Button size="lg" onClick={onEdit}>
          <PencilIcon />
          Edit
        </Button>
      </DrawerFooter>
    </div>
  )
}

function Hearts({ level, className }: { level: number; className?: string }) {
  return (
    <span
      aria-label={`${level} of ${HEART_LEVELS.length}`}
      className={cn("flex gap-0.5", className)}
    >
      {HEART_LEVELS.map((item) => (
        <HeartIcon
          key={item.level}
          aria-hidden
          className={cn(
            "size-4 text-muted-foreground/40",
            item.level <= level && "fill-brand-red text-brand-red"
          )}
        />
      ))}
    </span>
  )
}

function HeartCheckForm({
  today,
  check,
  onDone,
}: {
  /** "YYYY-MM-DD"; the default date and the latest one allowed. */
  today: string
  /** The heart check to edit; omit to add a new one. */
  check?: HeartCheck
  onDone: () => void
}) {
  const [level, setLevel] = React.useState<HeartLevel | null>(
    check?.level ?? null
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (level === null) return
    const form = new FormData(event.currentTarget)
    const date = String(form.get("date")) || today
    const details = String(form.get("details")).trim() || undefined
    if (check) updateHeartCheck(check.id, { level, date, details })
    else addHeartCheck({ level, date, details })
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      <DrawerHeader>
        <DrawerTitle>{check ? "Edit heart check" : "Heart check"}</DrawerTitle>
        <DrawerDescription>Where is your heart today?</DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col gap-5 overflow-y-auto p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Date</span>
          <Input
            name="date"
            type="date"
            defaultValue={check?.date ?? today}
            max={today}
            required
          />
        </label>
        <div role="radiogroup" aria-label="Level" className="grid gap-2">
          {HEART_LEVELS.map((item) => {
            const selected = level === item.level
            return (
              <button
                key={item.level}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setLevel(item.level)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl bg-muted/60 p-4 text-left ring-2 ring-transparent transition-colors",
                  selected && "bg-secondary ring-primary dark:ring-gold"
                )}
              >
                <Hearts level={item.level} className="w-14 shrink-0" />
                <span className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Details{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </span>
          <Textarea
            name="details"
            defaultValue={check?.details}
            rows={4}
            placeholder="What's on your heart?"
          />
        </label>
      </div>
      <DrawerFooter>
        <Button type="submit" size="lg" disabled={level === null}>
          Save
        </Button>
      </DrawerFooter>
    </form>
  )
}

export { HeartCheckList }
