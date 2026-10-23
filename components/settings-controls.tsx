"use client"

import * as React from "react"
import {
  CheckIcon,
  DownloadIcon,
  MonitorIcon,
  MoonIcon,
  ShareIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "cn"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { clearHeartChecks, useHeartChecks } from "@/lib/heart-checks"
import { promptInstall, useInstallState } from "@/lib/install-prompt"
import { clearMemoryVerses, useMemoryVerses } from "@/lib/memory-verses"

const themes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
]

const noop = () => () => {}

function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  // The stored theme is only known on the client; render unselected until hydrated.
  const hydrated = React.useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const selected = hydrated && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-medium text-muted-foreground transition-colors",
              selected && "bg-background text-foreground shadow-sm"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

const rowClassName =
  "flex items-center gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/8"

function InstallAppButton() {
  const state = useInstallState()

  if (state === "installed") {
    return (
      <div className={rowClassName}>
        <CheckIcon className="size-5 text-primary" />
        <span className="flex-1 font-medium">App installed</span>
      </div>
    )
  }

  if (state === "ios") {
    return (
      <div className={rowClassName}>
        <ShareIcon className="size-5 text-primary" />
        <span className="flex flex-1 flex-col">
          <span className="font-medium">Install app</span>
          <span className="text-sm text-muted-foreground">
            Tap Share, then Add to Home Screen.
          </span>
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={state !== "available"}
      onClick={promptInstall}
      className={cn(
        rowClassName,
        "text-primary transition-colors active:bg-muted disabled:opacity-50"
      )}
    >
      <DownloadIcon className="size-5" />
      <span className="flex flex-1 flex-col">
        <span className="font-medium">Install app</span>
        {state === "unsupported" && (
          <span className="text-sm text-muted-foreground">
            Use your browser menu to install.
          </span>
        )}
      </span>
    </button>
  )
}

function ClearDataButton() {
  const verseCount = useMemoryVerses().length
  const checkCount = useHeartChecks().length
  const count = verseCount + checkCount
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        disabled={count === 0}
        onClick={() => setOpen(true)}
        className={cn(
          rowClassName,
          "text-destructive transition-colors active:bg-muted disabled:opacity-50"
        )}
      >
        <Trash2Icon className="size-5" />
        <span className="flex-1 font-medium">Clear my data</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {count}
        </span>
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {verseCount} memory{" "}
              {verseCount === 1 ? "verse" : "verses"} and {checkCount} heart{" "}
              {checkCount === 1 ? "check" : "checks"} from this device. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                clearMemoryVerses()
                clearHeartChecks()
                setOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { ClearDataButton, InstallAppButton, ThemeSelector }
