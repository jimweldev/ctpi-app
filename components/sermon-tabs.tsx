"use client"

import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SermonTab = {
  value: string
  label: string
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
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-4 bg-background/85 px-4 py-2 backdrop-blur-xl">
        <TabsList className="h-10! w-full [scrollbar-width:none] overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-3">
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
              <Button
                variant="secondary"
                size="lg"
                className="self-end"
                onClick={() => select(next.value)}
              >
                Next: {next.label}
                <ChevronRightIcon />
              </Button>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

export { SermonTabs }
