"use client"

import * as React from "react"
import { move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import {
  BrainIcon,
  GripVerticalIcon,
  LibraryIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { ConfirmDelete } from "@/components/confirm-delete"
import { FilterChips } from "@/components/filter-chips"
import { PageHeader } from "@/components/page-header"
import { matchesSearch, SearchField } from "@/components/search-field"
import { SuggestInput } from "@/components/suggest-input"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { VerseLibrary } from "@/components/verse-library"
import {
  addMemoryVerse,
  getStatus,
  MEMORY_STATUSES,
  type MemoryStatus,
  type MemoryVerse,
  removeMemoryVerse,
  reorderMemoryVerses,
  updateMemoryVerse,
  useMemoryVerses,
} from "@/lib/memory-verses"
import { BIBLE_BOOKS, BIBLE_VERSIONS, splitReference } from "@/lib/bible-books"
import { cn } from "@/lib/utils"
import type { ChurchVerse } from "@/lib/verses"

function MemoryVerseList({
  churchVerses,
  tags,
}: {
  churchVerses: ChurchVerse[]
  tags: string[]
}) {
  const verses = useMemoryVerses()
  const [tab, setTab] = React.useState<"mine" | "church">("mine")
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<MemoryStatus | "all">("all")
  const filtering = query.trim() !== "" || status !== "all"
  const shown = verses.filter(
    (verse) =>
      (status === "all" || getStatus(verse) === status) &&
      matchesSearch(query, verse.reference, verse.version, verse.text)
  )
  const [editorOpen, setEditorOpen] = React.useState(false)
  // Changing the key resets the form for each open.
  const [editor, setEditor] = React.useState<{
    key: number
    verse?: MemoryVerse
  }>({ key: 0 })

  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [viewingId, setViewingId] = React.useState<string>()
  // Read from the list so edits show up while the drawer is open.
  const viewing = verses.find((verse) => verse.id === viewingId)

  /** Open the form to add a verse, or to edit `verse`. */
  function openEditor(verse?: MemoryVerse) {
    setEditor((current) => ({ key: current.key + 1, verse }))
    setEditorOpen(true)
  }

  function openViewer(verse: MemoryVerse) {
    setViewingId(verse.id)
    setViewerOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Verses"
        action={
          tab === "mine" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add memory verse"
              onClick={() => openEditor()}
            >
              <PlusIcon className="size-6 text-primary" />
            </Button>
          )
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-4">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "mine" | "church")}
          className="gap-4"
        >
          <TabsList className="h-10! w-full">
            <TabsTrigger value="mine">Memory Verses</TabsTrigger>
            <TabsTrigger value="church">Church Verses</TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="flex flex-col gap-3 text-base">
            {verses.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BrainIcon />
                  </EmptyMedia>
                  <EmptyTitle>No memory verses yet</EmptyTitle>
                  <EmptyDescription>
                    Add a verse you want to memorize. It stays on this device.
                  </EmptyDescription>
                </EmptyHeader>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => openEditor()}>
                    <PlusIcon />
                    Add memory verse
                  </Button>
                  <Button variant="ghost" onClick={() => setTab("church")}>
                    <LibraryIcon />
                    Browse church verses
                  </Button>
                </div>
              </Empty>
            ) : (
              <>
                <MemoryProgress verses={verses} />
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="Search memory verses"
                />
                <FilterChips
                  label="Filter by status"
                  options={[
                    { value: "all", label: "All" },
                    ...MEMORY_STATUSES.map(({ value, label }) => ({
                      value,
                      label,
                    })),
                  ]}
                  value={status}
                  onChange={setStatus}
                />
                {shown.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {query.trim()
                      ? `No memory verses match “${query.trim()}”.`
                      : "No memory verses with this status."}
                  </p>
                ) : (
                  <DragDropProvider
                    onDragEnd={(event) => {
                      if (event.canceled) return
                      reorderMemoryVerses(move(verses, event))
                    }}
                  >
                    {shown.map((verse, index) => (
                      <MemoryVerseCard
                        key={verse.id}
                        verse={verse}
                        index={index}
                        // Filters hide verses, so only reorder the full list.
                        sortable={!filtering}
                        onOpen={() => openViewer(verse)}
                      />
                    ))}
                  </DragDropProvider>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="church" className="text-base">
            <VerseLibrary verses={churchVerses} tags={tags} />
          </TabsContent>
        </Tabs>
      </main>
      <VerseViewer
        verse={viewing}
        open={viewerOpen && viewing !== undefined}
        onOpenChange={setViewerOpen}
        onEdit={() => {
          setViewerOpen(false)
          if (viewing) openEditor(viewing)
        }}
      />
      <Drawer open={editorOpen} onOpenChange={setEditorOpen} showSwipeHandle>
        <DrawerContent>
          <VerseForm
            key={editor.key}
            verse={editor.verse}
            onDone={() => {
              setEditorOpen(false)
              setTab("mine")
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

function MemoryVerseCard({
  verse,
  index,
  sortable,
  onOpen,
}: {
  verse: MemoryVerse
  index: number
  sortable: boolean
  onOpen: () => void
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: verse.id,
    index,
    disabled: !sortable,
  })

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center rounded-2xl bg-card shadow-xs ring-1 ring-foreground/8",
        isDragging && "z-10 shadow-lg ring-primary/40"
      )}
    >
      {sortable && (
        <Button
          ref={handleRef}
          variant="ghost"
          size="icon-sm"
          className="ml-1 size-11 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${verse.reference}`}
        >
          <GripVerticalIcon />
        </Button>
      )}
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-2 p-4 text-left transition-transform active:scale-[0.98]",
          sortable && "pl-0"
        )}
      >
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{verse.reference}</span>
          {verse.version && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {verse.version}
            </span>
          )}
          <StatusPill status={getStatus(verse)} className="ml-auto" />
        </span>
        <span className="truncate font-serif text-[0.9375rem] text-muted-foreground">
          {verse.text}
        </span>
      </button>
    </div>
  )
}

const STATUS_STYLES: Record<MemoryStatus, string> = {
  new: "bg-secondary text-secondary-foreground",
  learning: "bg-gold text-gold-foreground",
  memorized: "bg-primary text-primary-foreground",
}

function StatusPill({
  status,
  className,
}: {
  status: MemoryStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase",
        STATUS_STYLES[status],
        className
      )}
    >
      {MEMORY_STATUSES.find((option) => option.value === status)?.label}
    </span>
  )
}

/** How many verses are memorized, with a bar split by status. */
function MemoryProgress({ verses }: { verses: MemoryVerse[] }) {
  const counts = MEMORY_STATUSES.map((option) => ({
    ...option,
    count: verses.filter((verse) => getStatus(verse) === option.value).length,
  }))
  const memorized = counts.find((c) => c.value === "memorized")?.count ?? 0
  // Memorized first, so the bar fills from the left as verses are learned.
  const segments = [...counts].reverse()

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-xs ring-1 ring-foreground/8">
      <p className="flex items-baseline gap-1.5">
        <span className="text-2xl leading-none font-bold">{memorized}</span>
        <span className="text-sm text-muted-foreground">
          of {verses.length} memorized
        </span>
      </p>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
        {segments.map(
          (segment) =>
            segment.count > 0 && (
              <span
                key={segment.value}
                className={STATUS_STYLES[segment.value]}
                style={{ flexGrow: segment.count }}
              />
            )
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.value} className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                STATUS_STYLES[segment.value]
              )}
            />
            {segment.label} {segment.count}
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusChips({
  value,
  onChange,
}: {
  value: MemoryStatus
  onChange: (value: MemoryStatus) => void
}) {
  return (
    <FilterChips
      label="Status"
      options={[...MEMORY_STATUSES]}
      value={value}
      onChange={onChange}
      className="mx-0 px-0"
    />
  )
}

function VerseViewer({
  verse,
  open,
  onOpenChange,
  onEdit,
}: {
  verse?: MemoryVerse
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}) {
  // Keep showing the last verse while the drawer animates closed.
  const [shown, setShown] = React.useState(verse)
  if (verse && verse !== shown) setShown(verse)

  // The drawer stays mounted (only its content waits for a verse), so even
  // the first open animates in.
  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        {shown && (
          <>
            <DrawerHeader>
              <DrawerTitle>{shown.reference}</DrawerTitle>
              {shown.version && (
                <DrawerDescription>{shown.version}</DrawerDescription>
              )}
            </DrawerHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
              <blockquote className="font-serif text-xl leading-relaxed whitespace-pre-line">
                {shown.text}
              </blockquote>
              <StatusChips
                value={getStatus(shown)}
                onChange={(status) => updateMemoryVerse(shown.id, { status })}
              />
            </div>
            <DrawerFooter className="grid grid-cols-2">
              <ConfirmDelete
                title={`Delete ${shown.reference}?`}
                description="This removes the verse from your memory verses. This can't be undone."
                onConfirm={() => {
                  removeMemoryVerse(shown.id)
                  onOpenChange(false)
                }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-destructive"
                >
                  <Trash2Icon />
                  Delete
                </Button>
              </ConfirmDelete>
              <Button size="lg" onClick={onEdit}>
                <PencilIcon />
                Edit
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

const bookItems = BIBLE_BOOKS.map((value) => ({ value }))

function VerseForm({
  verse,
  onDone,
}: {
  /** The verse to edit; omit to add a new one. */
  verse?: MemoryVerse
  onDone: () => void
}) {
  const { book, passage } = splitReference(verse?.reference ?? "")
  const [status, setStatus] = React.useState<MemoryStatus>(
    verse ? getStatus(verse) : "new"
  )

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const book = String(form.get("book")).trim()
    const passage = String(form.get("passage")).trim()
    const reference = [book, passage].filter(Boolean).join(" ")
    const text = String(form.get("text")).trim()
    const version = String(form.get("version")).trim().toUpperCase()
    if (!reference || !text) return

    const fields = { reference, text, version: version || undefined, status }
    if (verse) updateMemoryVerse(verse.id, fields)
    else addMemoryVerse(fields)
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      <DrawerHeader>
        <DrawerTitle>
          {verse ? "Edit memory verse" : "Add memory verse"}
        </DrawerTitle>
        <DrawerDescription>Saved on this device only.</DrawerDescription>
      </DrawerHeader>
      <FieldGroup className="overflow-y-auto p-4">
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field>
            <FieldLabel htmlFor="book">Book</FieldLabel>
            <SuggestInput
              id="book"
              name="book"
              items={bookItems}
              defaultValue={book}
              placeholder="Psalms"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="passage">Chapter:verse</FieldLabel>
            <Input
              id="passage"
              name="passage"
              defaultValue={passage}
              placeholder="119:11"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="version">Version</FieldLabel>
          <SuggestInput
            id="version"
            name="version"
            items={BIBLE_VERSIONS}
            defaultValue={verse?.version}
            placeholder="NIV"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="text">Verse</FieldLabel>
          <Textarea
            id="text"
            name="text"
            defaultValue={verse?.text}
            rows={5}
            placeholder="I have hidden your word in my heart…"
            required
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <StatusChips value={status} onChange={setStatus} />
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" size="lg">
          Save
        </Button>
      </DrawerFooter>
    </form>
  )
}

export { MemoryVerseList }
