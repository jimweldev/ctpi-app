"use client"

import * as React from "react"
import {
  CalendarClockIcon,
  HeartIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "cn"

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  addHeartCheck,
  formatHeartCheckDate,
  type HeartCheck,
  MAX_RATING,
  rateHeartCheck,
  removeHeartCheck,
  useHeartChecks,
} from "@/lib/heart-checks"

function HeartCheckList() {
  const checks = useHeartChecks()
  const [adding, setAdding] = React.useState(false)

  // Unrated checks are still to do (soonest first); rated ones are done
  // (most recent first).
  const upcoming = checks
    .filter((check) => check.rating === undefined)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const done = checks
    .filter((check) => check.rating !== undefined)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))

  return (
    <>
      <PageHeader
        title="Heart Check"
        back={{ href: "/", label: "Home" }}
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Schedule heart check"
            onClick={() => setAdding(true)}
          >
            <PlusIcon className="size-6 text-primary" />
          </Button>
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
        {checks.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartIcon />
              </EmptyMedia>
              <EmptyTitle>No heart checks yet</EmptyTitle>
              <EmptyDescription>
                Set a time to pause and examine your heart before God, then rate
                how it went. It stays on this device.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setAdding(true)}>
              <PlusIcon />
              Schedule heart check
            </Button>
          </Empty>
        ) : (
          <>
            <HeartCheckSection title="Upcoming" checks={upcoming} />
            <HeartCheckSection title="Done" checks={done} />
          </>
        )}
      </main>
      <ScheduleDrawer open={adding} onOpenChange={setAdding} />
    </>
  )
}

function HeartCheckSection({
  title,
  checks,
}: {
  title: string
  checks: HeartCheck[]
}) {
  if (checks.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h2>
      {checks.map((check) => (
        <HeartCheckCard key={check.id} check={check} />
      ))}
    </section>
  )
}

function HeartCheckCard({ check }: { check: HeartCheck }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/8">
      <header className="flex items-center gap-2">
        <CalendarClockIcon className="size-4 text-muted-foreground" />
        <time dateTime={check.scheduledAt} className="font-semibold">
          {formatHeartCheckDate(check.scheduledAt)}
        </time>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-muted-foreground"
          aria-label="Delete heart check"
          onClick={() => removeHeartCheck(check.id)}
        >
          <Trash2Icon />
        </Button>
      </header>
      {check.description && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {check.description}
        </p>
      )}
      <HeartRating
        value={check.rating}
        onChange={(rating) => rateHeartCheck(check.id, rating)}
      />
    </article>
  )
}

function HeartRating({
  value = 0,
  onChange,
}: {
  value?: number
  onChange: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <div role="radiogroup" aria-label="Rating" className="flex">
        {Array.from({ length: MAX_RATING }, (_, index) => {
          const rating = index + 1
          const filled = rating <= value
          return (
            <button
              key={rating}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${rating} of ${MAX_RATING}`}
              onClick={() => onChange(rating)}
              className="flex size-9 items-center justify-center rounded-full transition-transform active:scale-90"
            >
              <HeartIcon
                className={cn(
                  "size-6 text-muted-foreground/50",
                  filled && "fill-brand-red text-brand-red"
                )}
              />
            </button>
          )
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {value ? `${value}/${MAX_RATING}` : "Tap to rate"}
      </span>
    </div>
  )
}

function ScheduleDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const scheduledAt = String(form.get("scheduledAt"))
    const description = String(form.get("description")).trim()
    if (!scheduledAt) return

    addHeartCheck({ scheduledAt, description: description || undefined })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
          <DrawerHeader>
            <DrawerTitle>Schedule heart check</DrawerTitle>
            <DrawerDescription>Saved on this device only.</DrawerDescription>
          </DrawerHeader>
          <FieldGroup className="overflow-y-auto p-4">
            <Field>
              <FieldLabel htmlFor="scheduledAt">Date and time</FieldLabel>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="What do you want to bring before God?"
              />
              <FieldDescription>Optional.</FieldDescription>
            </Field>
          </FieldGroup>
          <DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button type="submit" size="lg">
              Schedule
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export { HeartCheckList }
