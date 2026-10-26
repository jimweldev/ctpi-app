"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SermonTab = {
  value: string
  label: string
  /** Shown on the "Up next" card, e.g. the point's title. */
  title?: string
  content: React.ReactNode
}

/**
 * Sermon parts (intro, then each point) as tabs. The tab bar sticks under
 * the page header so it can be reached from anywhere in a long point.
 */
function SermonTabs({ tabs }: { tabs: SermonTab[] }) {
  const [value, setValue] = React.useState(tabs[0]?.value)
  const root = React.useRef<HTMLDivElement>(null)

  function select(next: string) {
    setValue(next)
    // Scrolled into a part: jump back to the top of the new one.
    const element = root.current
    if (element && element.getBoundingClientRect().top < 0) {
      element.scrollIntoView({ block: "start" })
    }
  }

  return (
    <Tabs
      ref={root}
      value={value}
      onValueChange={(next) => select(String(next))}
      className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] gap-5"
    >
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-4 bg-background/80 py-2 backdrop-blur-xl">
        <TabsList className="h-auto! w-full [scrollbar-width:none] justify-start gap-1.5 overflow-x-auto bg-transparent px-4 py-0.5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-9 flex-none rounded-full bg-card px-4 text-muted-foreground ring-1 ring-foreground/6 after:hidden data-active:bg-foreground data-active:text-background data-active:shadow-none data-active:ring-foreground dark:data-active:border-transparent dark:data-active:bg-foreground dark:data-active:text-background"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab, index) => {
        const next = tabs[index + 1]
        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="flex flex-col gap-6 text-base"
          >
            {tab.content}
            {next && (
              <button
                type="button"
                onClick={() => select(next.value)}
                className="mt-2 flex items-center gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/6 transition-transform active:scale-[0.98]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    Up next: {next.label}
                  </span>
                  <span className="truncate font-semibold">
                    {next.title ?? next.label}
                  </span>
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ChevronRightIcon className="size-5" />
                </span>
              </button>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

export { SermonTabs }
