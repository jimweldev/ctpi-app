"use client"

import { cn } from "cn"

/** A horizontally scrolling row of single-choice filter chips. */
function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 py-0.5",
        className
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 shrink-0 items-center rounded-full bg-card px-3 text-xs font-medium whitespace-nowrap text-muted-foreground ring-1 ring-foreground/6 transition-colors",
              selected && "bg-foreground text-background ring-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { FilterChips }
