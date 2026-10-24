import * as React from "react"
import { cn } from "cn"

/** Styles usable in `[text]{style style}` spans, e.g. `{underline blue}`. */
const SPAN_STYLES: Record<string, string> = {
  bold: "font-bold",
  italic: "italic",
  underline: "underline decoration-2 underline-offset-4",
  highlight: "rounded-sm bg-gold/35 box-decoration-clone px-0.5",
  blue: "text-sky-700 dark:text-sky-300",
  gold: "text-amber-700 dark:text-gold",
  red: "text-brand-red",
}

// `[text]{styles}`, `**bold**` or `*italic*`.
const INLINE = /(\[[^\]]+\]\{[^}]+\}|\*\*[^*]+\*\*|\*[^*]+\*)/

/**
 * Inline formatting as written: `**bold**`, `*italic*`, and
 * `[text]{styles}` spans with any of bold, italic, underline, highlight,
 * blue, gold, red. Spans can hold bold and italic inside.
 */
function InlineText({ text }: { text: string }) {
  return text.split(INLINE).map((part, index) => {
    const span = part.match(/^\[([^\]]+)\]\{([^}]+)\}$/)
    if (span) {
      const [, inner, styles] = span
      return (
        <span
          key={index}
          className={cn(styles.split(/\s+/).map((style) => SPAN_STYLES[style]))}
        >
          <InlineText text={inner} />
        </span>
      )
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

/**
 * Text shown as written: a blank line starts a new paragraph, single line
 * breaks are kept, inline formatting as in `InlineText`, and a paragraph
 * wrapped in `->` … `<-` is centered.
 */
function FormattedText({ text }: { text: string }) {
  return text.split(/\n{2,}/).map((paragraph, index) => {
    const trimmed = paragraph.trim()
    const centered = trimmed.startsWith("->") && trimmed.endsWith("<-")
    return (
      <p
        key={index}
        className={cn("whitespace-pre-line", centered && "text-center")}
      >
        <InlineText text={centered ? trimmed.slice(2, -2).trim() : paragraph} />
      </p>
    )
  })
}

export { FormattedText, InlineText }
