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

function MemoryVerseList({
  churchVerses,
  tags,
}: {
  churchVerses: ChurchVerse[]
  tags: string[]
}) {
  const verses = useMemoryVerses()
  const [tab, setTab] = React.useState<"mine" | "church">("mine")
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
      <PageHeader
        title="Verses"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add verse"
            onClick={() => openEditor()}
          >
            <PlusIcon className="size-6 text-primary" />
          </Button>
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
                    Add verse
                  </Button>
                  <Button variant="ghost" onClick={() => setTab("church")}>
                    <LibraryIcon />
                    Browse church verses
                  </Button>
                </div>
              </Empty>
            ) : (
              verses.map((verse) => (
                <figure
                  key={verse.id}
                  className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-xs ring-1 ring-foreground/8"
                >
                  <figcaption className="flex items-center gap-2">
                    <span className="font-semibold">{verse.reference}</span>
                    {verse.version && (
                      <span className="text-xs text-muted-foreground">
                        {verse.version}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="ml-auto text-muted-foreground"
                      aria-label={`Edit ${verse.reference}`}
                      onClick={() => openEditor(verse)}
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
              ))
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
