"use client"

import * as React from "react"
import { move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import {
  BrainIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  LibraryIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { FilterChips } from "@/components/filter-chips"
import { PageHeader } from "@/components/page-header"
import { matchesSearch, SearchField } from "@/components/search-field"
import { SuggestInput } from "@/components/suggest-input"
import { Badge } from "@/components/ui/badge"
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
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="Search memory verses"
                />
                <FilterChips
                  label="Filter by status"
                  options={[
                    { value: "all", label: "All" },
                    ...MEMORY_STATUSES.map((option) => ({
                      value: option.value,
                      label: `${option.label} ${
                        verses.filter(
                          (verse) => getStatus(verse) === option.value
                        ).length
                      }`,
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
      <VerseDrawer
        key={editor.key}
        verse={editor.verse}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={() => setTab("mine")}
      />
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
          className="-mr-3 ml-2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${verse.reference}`}
        >
          <GripVerticalIcon />
        </Button>
      )}
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 p-5 text-left transition-transform active:scale-[0.98]"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{verse.reference}</span>
            <StatusBadge status={getStatus(verse)} />
          </span>
          {verse.version && (
            <span className="text-xs text-muted-foreground">
              {verse.version}
            </span>
          )}
        </span>
        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: MemoryStatus }) {
  if (status === "new") return null
  return (
    <Badge
      variant={status === "memorized" ? "default" : "secondary"}
      className={cn(status === "learning" && "bg-gold text-gold-foreground")}
    >
      {MEMORY_STATUSES.find((option) => option.value === status)?.label}
    </Badge>
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
  if (!shown) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
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
        <DrawerFooter className="grid grid-cols-2 gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button
            variant="secondary"
            size="lg"
            className="text-destructive"
            onClick={() => {
              removeMemoryVerse(shown.id)
              onOpenChange(false)
            }}
          >
            <Trash2Icon />
            Delete
          </Button>
          <Button size="lg" onClick={onEdit}>
            <PencilIcon />
            Edit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const bookItems = BIBLE_BOOKS.map((value) => ({ value }))

function VerseDrawer({
  verse,
  open,
  onOpenChange,
  onSaved,
}: {
  /** The verse to edit; omit to add a new one. */
  verse?: MemoryVerse
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
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
    onOpenChange(false)
    onSaved()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
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
                  inputMode="decimal"
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
          <DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button type="submit" size="lg">
              Save
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export { MemoryVerseList }
