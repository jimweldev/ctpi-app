"use client"

import * as React from "react"
import {
  BrainIcon,
  LibraryIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { VerseLibrary } from "@/components/verse-library"
import {
  addMemoryVerse,
  type MemoryVerse,
  removeMemoryVerse,
  updateMemoryVerse,
  useMemoryVerses,
} from "@/lib/memory-verses"
import type { ChurchVerse } from "@/lib/verses"
import { getBook, getChapterVerse } from "@/lib/bible-books"

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
  const groups = groupByBook(
    verses.filter((verse) =>
      matchesSearch(query, verse.reference, verse.version, verse.text)
    )
  )
  const [editorOpen, setEditorOpen] = React.useState(false)
  // Changing the key resets the form for each open.
  const [editor, setEditor] = React.useState<{
    key: number
    verse?: MemoryVerse
  }>({ key: 0 })

  /** Open the form to add a verse, or to edit `verse`. */
  function openEditor(verse?: MemoryVerse) {
    setEditor((current) => ({ key: current.key + 1, verse }))
    setEditorOpen(true)
  }

  return (
    <>
      <PageHeader title="Verses" />
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
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => openEditor()}
                >
                  <PlusIcon />
                  Add memory verse
                </Button>
                <SearchField
                  value={query}
                  onChange={setQuery}
                  placeholder="Search memory verses"
                />
                {groups.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No memory verses match “{query.trim()}”.
                  </p>
                ) : (
                  groups.map((group) => (
                    <section
                      key={group.name}
                      className="flex flex-col gap-3 pt-2"
                    >
                      <h2 className="flex items-baseline gap-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                        {group.name}
                        <span className="tracking-normal tabular-nums">
                          {group.verses.length}
                        </span>
                      </h2>
                      {group.verses.map((verse) => (
                        <MemoryVerseCard
                          key={verse.id}
                          verse={verse}
                          onEdit={() => openEditor(verse)}
                        />
                      ))}
                    </section>
                  ))
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="church" className="text-base">
            <VerseLibrary verses={churchVerses} tags={tags} />
          </TabsContent>
        </Tabs>
      </main>
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
  onEdit,
}: {
  verse: MemoryVerse
  onEdit: () => void
}) {
  return (
    <figure className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/8">
      <figcaption className="flex items-center gap-2">
        <span className="font-semibold">{verse.reference}</span>
        {verse.version && (
          <span className="text-xs text-muted-foreground">{verse.version}</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-muted-foreground"
          aria-label={`Edit ${verse.reference}`}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={`Delete ${verse.reference}`}
          onClick={() => removeMemoryVerse(verse.id)}
        >
          <Trash2Icon />
        </Button>
      </figcaption>
      <blockquote className="font-serif text-[1.0625rem] leading-relaxed whitespace-pre-line">
        {verse.text}
      </blockquote>
    </figure>
  )
}

/** Verses grouped by Bible book in canonical order, sorted by chapter:verse. */
function groupByBook(verses: MemoryVerse[]) {
  const groups = new Map<
    string,
    { name: string; order: number; verses: MemoryVerse[] }
  >()
  for (const verse of verses) {
    const book = getBook(verse.reference)
    const group = groups.get(book.name) ?? { ...book, verses: [] }
    group.verses.push(verse)
    groups.set(book.name, group)
  }
  const position = (verse: MemoryVerse) => {
    const { chapter, verse: number } = getChapterVerse(verse.reference)
    return chapter * 1000 + number
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map((group) => ({
      ...group,
      verses: group.verses.sort((a, b) => position(a) - position(b)),
    }))
}

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
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const reference = String(form.get("reference")).trim()
    const text = String(form.get("text")).trim()
    const version = String(form.get("version")).trim().toUpperCase()
    if (!reference || !text) return

    const fields = { reference, text, version: version || undefined }
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
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <Field>
                <FieldLabel htmlFor="reference">Reference</FieldLabel>
                <Input
                  id="reference"
                  name="reference"
                  defaultValue={verse?.reference}
                  placeholder="Psalms 119:11"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="version">Version</FieldLabel>
                <Input
                  id="version"
                  name="version"
                  defaultValue={verse?.version}
                  placeholder="NLT"
                />
              </Field>
            </div>
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
          </FieldGroup>
          <DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button type="submit" size="lg">
              Save verse
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export { MemoryVerseList }
