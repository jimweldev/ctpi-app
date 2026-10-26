"use client"

import { SearchIcon, XIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

/** A search box with a clear button. */
function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <InputGroup className="h-11 rounded-full border-transparent bg-card px-1 ring-1 ring-foreground/6">
      <InputGroupAddon>
        <SearchIcon className="size-4.5" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        inputMode="search"
        enterKeyHint="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="text-base [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => onChange("")}
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

/** True when every word of `query` appears somewhere in `fields`. */
function matchesSearch(query: string, ...fields: (string | undefined)[]) {
  const haystack = fields.join(" ").toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

export { matchesSearch, SearchField }
