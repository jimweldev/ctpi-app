import { ExternalLinkIcon, HandHeartIcon } from "lucide-react"

const FIRST_TIMERS_URL = "https://bit.ly/2RZC7NW"

// lucide-react v1 has no brand icons, so these are drawn in its stroke style.
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
} as const

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/calvarytemplephilippines",
    icon: (
      <svg {...iconProps}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/calvarytemple.ph/",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@LIGHTSHINESTV",
    icon: (
      <svg {...iconProps}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
]

/** First-timers form and the church's social pages, opened in a new tab. */
function ChurchLinks() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-base font-bold tracking-tight">Connect</h2>
      <a
        href={FIRST_TIMERS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/6 transition-transform active:scale-[0.98]"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold-text">
          <HandHeartIcon className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm leading-tight font-semibold">
            First time at Calvary Temple?
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Fill out the first-timers form so we can welcome you
          </span>
        </span>
        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" />
      </a>
      <div className="grid grid-cols-3 gap-3">
        {socials.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-card py-3 text-xs font-medium text-muted-foreground ring-1 ring-foreground/6 transition-colors active:bg-muted"
          >
            <span className="text-primary">{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </section>
  )
}

export { ChurchLinks }
