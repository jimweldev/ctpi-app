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
        "-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1",
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
              "shrink-0 rounded-full bg-muted px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors",
              selected && "bg-primary text-primary-foreground"
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
