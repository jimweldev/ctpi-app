"use client"

import * as React from "react"
import { cn } from "cn"

const ITEM_HEIGHT = 48
/** Items shown above and below the selected one. */
const PADDING_ITEMS = 2

/**
 * One scroll-snapping column of a phone-style wheel picker. The scroll
 * position is the source of truth after mount, so remount (via `key`) to
 * jump to a new `value`.
 */
function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const settle = React.useRef<number>(undefined)

  React.useLayoutEffect(() => {
    const index = items.findIndex((item) => item.value === value)
    if (ref.current) ref.current.scrollTop = Math.max(index, 0) * ITEM_HEIGHT
    // Only on mount: afterwards the user drives the scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToIndex(index: number) {
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" })
  }

  function onScroll() {
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => {
      const element = ref.current
      if (!element) return
      const index = Math.round(element.scrollTop / ITEM_HEIGHT)
      const item = items[Math.min(Math.max(index, 0), items.length - 1)]
      onChange(item.value)
    }, 80)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = items.findIndex((item) => item.value === value)
    if (event.key === "ArrowDown" && index < items.length - 1) {
      event.preventDefault()
      scrollToIndex(index + 1)
    } else if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault()
      scrollToIndex(index - 1)
    }
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      style={{
        height: ITEM_HEIGHT * (PADDING_ITEMS * 2 + 1),
        paddingBlock: ITEM_HEIGHT * PADDING_ITEMS,
      }}
      className={cn(
        "snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-contain [mask-image:linear-gradient(transparent,black_30%,black_70%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.value}
          role="option"
          aria-selected={item.value === value}
          onClick={() => scrollToIndex(index)}
          style={{ height: ITEM_HEIGHT }}
          className={cn(
            "flex snap-center items-center justify-center text-3xl text-muted-foreground tabular-nums transition-colors",
            item.value === value && "font-semibold text-foreground"
          )}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

const HOURS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}))
const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, "0"),
}))
const PERIODS = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
]

/** Samsung-style hour / minute / AM-PM wheels for a 24-hour "HH:mm" value. */
function TimeWheelPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [hours, minutes] = value.split(":").map(Number)
  const hour12 = hours % 12 || 12
  const period = hours < 12 ? "AM" : "PM"

  function update(next: {
    hour12?: number
    minutes?: number
    period?: string
  }) {
    const h12 = next.hour12 ?? hour12
    const p = next.period ?? period
    const h24 = (h12 % 12) + (p === "PM" ? 12 : 0)
    const m = next.minutes ?? minutes
    onChange(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }

  return (
    <div className="relative flex items-center justify-center gap-1">
      {/* Selection band behind the middle row. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-1/2 h-12 -translate-y-1/2 rounded-2xl bg-muted"
      />
      <WheelColumn
        label="Hour"
        items={HOURS}
        value={hour12}
        onChange={(h) => update({ hour12: h })}
        className="relative w-20"
      />
      <span className="relative text-3xl font-semibold">:</span>
      <WheelColumn
        label="Minute"
        items={MINUTES}
        value={minutes}
        onChange={(m) => update({ minutes: m })}
        className="relative w-20"
      />
      <WheelColumn
        label="AM or PM"
        items={PERIODS}
        value={period}
        onChange={(p) => update({ period: p })}
        className="relative w-20 [&>[role=option]]:text-xl"
      />
    </div>
  )
}

export { TimeWheelPicker }
