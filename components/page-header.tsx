import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

/** Sticky iOS-style top bar. Pass `back` for a nested page. */
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
    <header className="sticky top-0 z-30 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto grid h-14 max-w-2xl grid-cols-[1fr_auto_1fr] items-center px-2">
        <div>
          {back && (
            <Link
              href={back.href}
              className="flex w-fit items-center gap-0.5 rounded-full py-2 pr-3 font-medium text-primary active:opacity-60"
            >
              <ChevronLeftIcon className="size-6" />
              {back.label}
            </Link>
          )}
        </div>
        <h1 className="max-w-[55vw] truncate text-base font-semibold">
          {title}
        </h1>
        <div className="flex justify-end">{action}</div>
      </div>
    </header>
  )
}

export { PageHeader }
