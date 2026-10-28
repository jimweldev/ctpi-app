"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookMarkedIcon,
  BookOpenIcon,
  HeartIcon,
  MessageCircleHeartIcon,
  HouseIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "cn"

import { useHeartCheckDue } from "@/lib/heart-check-due"

const tabs = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/sermons", label: "Sermons", icon: BookOpenIcon },
  { href: "/memory-verses", label: "Verses", icon: BookMarkedIcon },
  { href: "/prayer", label: "Prayer", icon: MessageCircleHeartIcon },
  { href: "/heart-check", label: "Heart Check", icon: HeartIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
]

function BottomNav() {
  const pathname = usePathname()
  const heartCheckDue = useHeartCheckDue()

  // Badge the installed app's icon too, where the platform supports it.
  React.useEffect(() => {
    if (!("setAppBadge" in navigator)) return
    const update = heartCheckDue
      ? navigator.setAppBadge()
      : navigator.clearAppBadge()
    update.catch(() => {
      // Not allowed here (e.g. not installed): the dot in the tab bar is enough.
    })
  }, [heartCheckDue])

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto mx-auto grid h-16 max-w-lg grid-cols-6 rounded-full bg-card/85 px-1 shadow-[0_8px_30px_-6px_oklch(0.2_0.04_284.5/0.18)] ring-1 ring-foreground/6 backdrop-blur-xl">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          const dot = href === "/heart-check" && heartCheckDue
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={dot ? `${label}, due now` : undefined}
                className={cn(
                  "group flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-medium whitespace-nowrap text-muted-foreground transition-colors",
                  active && "font-semibold text-primary"
                )}
              >
                <span
                  className={cn(
                    "relative flex h-7 w-11 items-center justify-center rounded-full transition-colors group-active:bg-muted",
                    active && "bg-secondary group-active:bg-secondary"
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2.25 : 1.75}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.15 : 0}
                    aria-hidden
                  />
                  {dot && (
                    <span
                      aria-hidden
                      className="absolute top-0.5 right-2.5 size-2.5 rounded-full bg-brand-red ring-2 ring-card"
                    />
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { BottomNav }
