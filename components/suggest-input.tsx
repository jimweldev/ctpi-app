"use client"

import { Autocomplete } from "@base-ui/react/autocomplete"
import { ChevronDownIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

type Suggestion = { value: string; label?: string }

/**
 * A text input with a pick list: choose a suggestion or type your own value.
 * Works in plain forms, since the value is the input's own text.
 */
function SuggestInput({
  items,
  defaultValue,
  ...props
}: {
  items: Suggestion[]
  defaultValue?: string
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <Autocomplete.Root
      items={items}
      defaultValue={defaultValue}
      itemToStringValue={(item) => item.value}
      openOnInputClick
    >
      <div className="relative">
        <Autocomplete.Input
          render={<Input />}
          autoComplete="off"
          className="pr-8"
          {...props}
        />
        <Autocomplete.Trigger
          aria-label="Show suggestions"
          className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground"
        >
          <ChevronDownIcon className="size-4" />
        </Autocomplete.Trigger>
      </div>
      <Autocomplete.Portal>
        <Autocomplete.Positioner
          sideOffset={6}
          align="start"
          className="isolate z-50"
        >
          <Autocomplete.Popup className="max-h-(--available-height) w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-empty:hidden data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
            <Autocomplete.List className="max-h-[min(--spacing(72),var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain p-1">
              {(item: Suggestion) => (
                <Autocomplete.Item
                  key={item.value}
                  value={item}
                  className="flex cursor-default items-baseline gap-2 rounded-sm px-2 py-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="font-medium">{item.value}</span>
                  {item.label && (
                    <span className="truncate text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  )}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

export { SuggestInput }
