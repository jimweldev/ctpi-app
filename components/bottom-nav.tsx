"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookMarkedIcon,
  BookOpenIcon,
  HeartIcon,
  HouseIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "cn"

const tabs = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/sermons", label: "Sermons", icon: BookOpenIcon },
  { href: "/memory-verses", label: "Verses", icon: BookMarkedIcon },
  { href: "/heart-check", label: "Heart Check", icon: HeartIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
]

function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto grid h-16 max-w-2xl grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors",
                  active && "text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors group-active:bg-muted",
                    active &&
                      "bg-secondary text-primary group-active:bg-secondary"
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2.25 : 1.75}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.15 : 0}
                    aria-hidden
                  />
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
