"use client"

import * as React from "react"
import { BrainIcon, PlusIcon, Trash2Icon } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  addMemoryVerse,
  removeMemoryVerse,
  useMemoryVerses,
} from "@/lib/memory-verses"

function MemoryVerseList() {
  const verses = useMemoryVerses()
  const [adding, setAdding] = React.useState(false)

  return (
    <>
      <PageHeader
        title="Memory Verses"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add verse"
            onClick={() => setAdding(true)}
          >
            <PlusIcon className="size-6 text-primary" />
          </Button>
        }
      />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-6">
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
            <Button onClick={() => setAdding(true)}>
              <PlusIcon />
              Add verse
            </Button>
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
      </main>
      <AddVerseDrawer open={adding} onOpenChange={setAdding} />
    </>
  )
}

function AddVerseDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const reference = String(form.get("reference")).trim()
    const text = String(form.get("text")).trim()
    const version = String(form.get("version")).trim().toUpperCase()
    if (!reference || !text) return

    addMemoryVerse({ reference, text, version: version || undefined })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
          <DrawerHeader>
            <DrawerTitle>Add memory verse</DrawerTitle>
            <DrawerDescription>Saved on this device only.</DrawerDescription>
          </DrawerHeader>
          <FieldGroup className="overflow-y-auto p-4">
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <Field>
                <FieldLabel htmlFor="reference">Reference</FieldLabel>
                <Input
                  id="reference"
                  name="reference"
                  placeholder="Psalms 119:11"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="version">Version</FieldLabel>
                <Input id="version" name="version" placeholder="NLT" />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="text">Verse</FieldLabel>
              <Textarea
                id="text"
                name="text"
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
