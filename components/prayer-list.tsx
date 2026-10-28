"use client"

import * as React from "react"
import { move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import {
  CircleCheckBigIcon,
  GripVerticalIcon,
  MessageCircleHeartIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react"

import { ConfirmDelete } from "@/components/confirm-delete"
import { FilterChips } from "@/components/filter-chips"
import { PageHeader } from "@/components/page-header"
import { matchesSearch, SearchField } from "@/components/search-field"
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
import { Textarea } from "@/components/ui/textarea"
import {
  addPrayer,
  type Prayer,
  removePrayer,
  reorderPrayers,
  updatePrayer,
  usePrayers,
} from "@/lib/prayers"
import { cn } from "@/lib/utils"

type Filter = "praying" | "answered" | "all"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "praying", label: "Praying" },
  { value: "answered", label: "Answered" },
  { value: "all", label: "All" },
]

function formatDay(time: number) {
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Move a prayer within the filtered list, keeping hidden prayers where they
 * are: the shown prayers are put back into the slots they held.
 */
function reorderWithin(all: Prayer[], shown: Prayer[], moved: Prayer[]) {
  const shownIds = new Set(shown.map((prayer) => prayer.id))
  const queue = [...moved]
  return all.map((prayer) =>
    shownIds.has(prayer.id) ? queue.shift()! : prayer
  )
}

function PrayerList() {
  const prayers = usePrayers()
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("praying")
  const searching = query.trim() !== ""
  const shown = prayers.filter(
    (prayer) =>
      (filter === "all" ||
        (filter === "answered") === (prayer.answeredAt !== undefined)) &&
      matchesSearch(query, prayer.title)
  )

  const [editorOpen, setEditorOpen] = React.useState(false)
  // Changing the key resets the form for each open.
  const [editor, setEditor] = React.useState<{ key: number; prayer?: Prayer }>({
    key: 0,
  })
  const [viewerOpen, setViewerOpen] = React.useState(false)
  const [viewingId, setViewingId] = React.useState<string>()
  // Read from the list so edits show up while the drawer is open.
  const viewing = prayers.find((prayer) => prayer.id === viewingId)

  /** Open the form to add a prayer, or to edit `prayer`. */
  function openEditor(prayer?: Prayer) {
    setEditor((current) => ({ key: current.key + 1, prayer }))
    setEditorOpen(true)
  }

  const answeredCount = prayers.filter((p) => p.answeredAt !== undefined).length

  return (
    <>
      <PageHeader
        title="Prayer"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add prayer"
            onClick={() => openEditor()}
          >
            <PlusIcon className="size-6 text-primary" />
          </Button>
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-4">
        {prayers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleHeartIcon />
              </EmptyMedia>
              <EmptyTitle>No prayers yet</EmptyTitle>
              <EmptyDescription>
                Keep a list of people and needs to pray for. It stays on this
                device.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => openEditor()}>
              <PlusIcon />
              Add prayer
            </Button>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                value={prayers.length - answeredCount}
                label="Praying for"
              />
              <Stat value={answeredCount} label="Answered" gold />
            </div>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search prayers"
            />
            <FilterChips
              label="Filter prayers"
              options={FILTERS}
              value={filter}
              onChange={setFilter}
            />
            {shown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {searching
                  ? `No prayers match “${query.trim()}”.`
                  : filter === "answered"
                    ? "No answered prayers yet. Open a prayer to mark it answered."
                    : "Nothing here. Tap + to add a prayer."}
              </p>
            ) : (
              <>
                <DragDropProvider
                  onDragEnd={(event) => {
                    if (event.canceled) return
                    reorderPrayers(
                      reorderWithin(prayers, shown, move(shown, event))
                    )
                  }}
                >
                  {shown.map((prayer, index) => (
                    <PrayerCard
                      key={prayer.id}
                      prayer={prayer}
                      index={index}
                      // Search hides prayers mid-list, so don't reorder then.
                      sortable={!searching}
                      onOpen={() => {
                        setViewingId(prayer.id)
                        setViewerOpen(true)
                      }}
                    />
                  ))}
                </DragDropProvider>
                {!searching && shown.length > 1 && (
                  <p className="px-1 text-center text-xs text-muted-foreground">
                    Drag the handle to put prayers in your own order.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </main>
      <PrayerViewer
        prayer={viewing}
        open={viewerOpen && viewing !== undefined}
        onOpenChange={setViewerOpen}
        onEdit={() => {
          setViewerOpen(false)
          if (viewing) openEditor(viewing)
        }}
      />
      <Drawer open={editorOpen} onOpenChange={setEditorOpen} showSwipeHandle>
        <DrawerContent>
          <PrayerForm
            key={editor.key}
            prayer={editor.prayer}
            onDone={() => {
              setEditorOpen(false)
              // A new prayer is still being prayed for: show it.
              if (!editor.prayer && filter === "answered") setFilter("praying")
            }}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}

function Stat({
  value,
  label,
  gold,
}: {
  value: number
  label: string
  gold?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-card p-4 ring-1 ring-foreground/6">
      <span
        className={cn(
          "text-2xl leading-none font-bold tabular-nums",
          gold && "text-gold-text"
        )}
      >
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

function PrayerCard({
  prayer,
  index,
  sortable,
  onOpen,
}: {
  prayer: Prayer
  index: number
  sortable: boolean
  onOpen: () => void
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: prayer.id,
    index,
    disabled: !sortable,
  })
  const answered = prayer.answeredAt !== undefined

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center rounded-2xl bg-card ring-1 ring-foreground/6",
        isDragging && "z-10 shadow-lg ring-primary/40"
      )}
    >
      {sortable && (
        <Button
          ref={handleRef}
          variant="ghost"
          size="icon-sm"
          className="ml-1 size-11 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${prayer.title}`}
        >
          <GripVerticalIcon />
        </Button>
      )}
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 p-4 text-left transition-transform active:scale-[0.98]",
          sortable && "pl-0"
        )}
      >
        <span
          className={cn(
            "line-clamp-3 min-w-0 flex-1 font-semibold break-words whitespace-pre-line",
            answered && "text-muted-foreground"
          )}
        >
          {prayer.title}
        </span>
        {answered && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-gold-foreground">
            <CircleCheckBigIcon className="size-3.5" />
            Answered
          </span>
        )}
      </button>
    </div>
  )
}

function PrayerViewer({
  prayer,
  open,
  onOpenChange,
  onEdit,
}: {
  prayer?: Prayer
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}) {
  // Keep showing the last prayer while the drawer animates closed.
  const [shown, setShown] = React.useState(prayer)
  if (prayer && prayer !== shown) setShown(prayer)

  const answered = shown?.answeredAt !== undefined

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        {shown && (
          <>
            <DrawerHeader>
              <DrawerTitle className="break-words whitespace-pre-line">
                {shown.title}
              </DrawerTitle>
              <DrawerDescription>
                Added {formatDay(shown.createdAt)}
                {shown.answeredAt !== undefined &&
                  `, answered ${formatDay(shown.answeredAt)}`}
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 py-2">
              <Button
                size="lg"
                variant={answered ? "secondary" : "default"}
                className={cn(
                  !answered && "bg-gold text-gold-foreground hover:bg-gold/90"
                )}
                onClick={() =>
                  updatePrayer(shown.id, {
                    answeredAt: answered ? undefined : Date.now(),
                  })
                }
              >
                {answered ? <RotateCcwIcon /> : <CircleCheckBigIcon />}
                {answered ? "Still praying" : "Mark as answered"}
              </Button>
            </div>
            <DrawerFooter className="grid grid-cols-2">
              <ConfirmDelete
                title="Delete this prayer?"
                description="This removes the prayer from your list. This can't be undone."
                onConfirm={() => {
                  removePrayer(shown.id)
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
              <Button variant="secondary" size="lg" onClick={onEdit}>
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

function PrayerForm({
  prayer,
  onDone,
}: {
  /** The prayer to edit; omit to add a new one. */
  prayer?: Prayer
  onDone: () => void
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get("title")).trim()
    if (!title) return

    if (prayer) updatePrayer(prayer.id, { title })
    else addPrayer({ title })
    onDone()
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      <DrawerHeader>
        <DrawerTitle>{prayer ? "Edit prayer" : "Add prayer"}</DrawerTitle>
        <DrawerDescription>Saved on this device only.</DrawerDescription>
      </DrawerHeader>
      <FieldGroup className="overflow-y-auto p-4">
        <Field>
          <FieldLabel htmlFor="title">What are you praying for?</FieldLabel>
          <Textarea
            id="title"
            name="title"
            defaultValue={prayer?.title}
            rows={4}
            placeholder="Mom's recovery after her surgery"
            required
          />
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

export { PrayerList }
