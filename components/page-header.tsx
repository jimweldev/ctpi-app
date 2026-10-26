import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

/**
 * Sticky top bar. Top-level pages get a large left-aligned title; pass
 * `back` for a nested page, which gets a compact centered title instead.
 */
function PageHeader({
  title,
  back,
  action,
}: {
  title: string
  back?: { href: string; label: string }
  action?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      {back ? (
        <div className="mx-auto grid h-14 max-w-2xl grid-cols-[1fr_auto_1fr] items-center px-2">
          <Link
            href={back.href}
            className="flex w-fit items-center gap-0.5 rounded-full py-2 pr-3 font-medium text-primary active:opacity-60"
          >
            <ChevronLeftIcon className="size-6" />
            {back.label}
          </Link>
          <h1 className="max-w-[55vw] truncate text-base font-semibold">
            {title}
          </h1>
          <div className="flex justify-end">{action}</div>
        </div>
      ) : (
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-5">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {action}
        </div>
      )}
    </header>
  )
}

export { PageHeader }
