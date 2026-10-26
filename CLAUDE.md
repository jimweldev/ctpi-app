# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js docs matching the installed version live in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`). Check them before using any Next.js API — this is Next 16.4 with React 19.3, newer than most training data.

## Commands

- `npm run dev` — dev server (also regenerates `AGENTS.md`; leave that file as-is)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint 9 flat config (`next/core-web-vitals` + `next/typescript`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` — Prettier on `**/*.{ts,tsx}`

No test framework is set up yet.

## Stack and structure

- App Router only (`app/`). Root `app/layout.tsx` sets fonts (Plus Jakarta Sans as `--font-sans`, Geist Mono as `--font-mono`) and wraps everything in `ThemeProvider`.
- `components/theme-provider.tsx` wraps `next-themes` (class-based, light default; "System" still selectable in Settings) and adds a global `d` hotkey to toggle dark mode, ignored while typing in inputs.
- UI is shadcn/ui with the `base-vega` style, built on **Base UI** (`@base-ui/react`), not Radix. Add components with `npx shadcn@latest add <name>`; they land in `components/ui/`. Variants use `class-variance-authority`.
- Tailwind CSS v4: no `tailwind.config` file. Theme tokens (oklch CSS variables, light + `.dark`) and `@theme inline` mappings are in `app/globals.css`.
- `cn` comes from the `cn` npm package; `lib/utils.ts` just re-exports it. Generated UI components import from `"cn"` directly.
- Path alias `@/*` maps to the repo root (`@/components`, `@/lib`, `@/hooks`).
- Base UI `Button` with `render={<Link />}` needs `nativeButton={false}`.

## App (Calvary Temple Philippines PWA, deployed on Vercel from `main`)

- Theme tokens in `app/globals.css` come from the logo (navy `#2a0e72`, red `#e91a10`, gold `#e2bd26`, cream `#fffcf3`). Beyond the shadcn tokens there are `gold`, `brand-red` and `hero` (navy banner that stays navy in dark mode, unlike `primary`). Scripture uses `font-serif` (Lora).
- Mobile-app shell: `components/bottom-nav.tsx` (floating pill tab bar, rendered in the root layout) and `components/page-header.tsx` (sticky top bar per page: large left-aligned title, or compact centered title with `back`). Labels and section headings are sentence case, no tracked all-caps. Layouts pad for `env(safe-area-inset-*)`.
- Spacing standard: pages use `px-4 py-4` (Home differs, it overlaps the hero); 12px (`gap-3`) between search, chips and cards; list cards are flat `rounded-2xl bg-card ring-1 ring-foreground/6` (no shadow) with `p-4`/`p-5`; feature cards (Home, due card, events) use `rounded-3xl`. Drawer actions go in `DrawerFooter`, which is a bordered bar with safe-area padding by default (two actions: `className="grid grid-cols-2"`).
- Sermon content is static data in `data/sermons.json`: a flat `sermons` list (each with a unique `slug`, ISO `date`, optional `series` slug) plus a `series` list holding series metadata. A sermon's `content` is an ordered list of typed blocks (`note`, `verse`, `point`, `section`); `point`/`section` nest their own blocks. Optional `outro` holds closing blocks. Note text is shown as written (line breaks, blank-line paragraphs, `**bold**`, `*italic*`, `->centered paragraph<-`). Verse text and notes both support `[text]{styles}` spans (`blue` and `gold` are the two key-word highlights in theme colors, `blue` first and `gold` second; also bold, italic, underline, highlight, red), rendered by `components/formatted-text.tsx`. The sermon page shows Intro (blocks before the first point) / Point N / Outro as tabs (`components/sermon-tabs.tsx`, grouping in `getSermonParts`). `lib/sermons.ts` sorts newest first and derives each sermon's series part number from date order; renderer is `components/sermon-content.tsx`. Pages live at `/sermons/[slug]`, prerendered via `generateStaticParams` with `dynamicParams = false`.
- Verse text is stored in the JSON (`verses: [{ number, text }]`). Copyright notices for NIV/NLT/CEV are on the Settings page; add one there when a new translation is used.
- User data lives only in `localStorage`, via the `createLocalList` helper in `lib/local-list.ts` (`useSyncExternalStore`, cross-tab sync): memory verses (`ctpi:memory-verses`, `lib/memory-verses.ts`) heart checks (`ctpi:heart-check-entries`, `lib/heart-checks.ts`; a 1-3 level self-rating with optional details) and heart check schedules (`ctpi:heart-check-alarms`, a key kept from when they were called alarms; `lib/heart-check-schedules.ts`; Samsung-alarm-style reminders at `/heart-check/schedule`, old `/heart-check/alarms` redirects: `HH:mm` time, repeat weekdays or a one-time date, on/off). `useHeartCheckDue` (`lib/heart-check-due.ts`: a schedule was due earlier today and no check since) drives the Heart Check banner, the Home card (`components/heart-check-due-card.tsx`), the red dot on the bottom-nav tab and the app icon badge. `useHeartCheckWeek` (same file) gives the last 7 days as done / missed / due / later / none for the "This week" strip on Heart Check (`components/heart-check-week.tsx`); a past day is missed if a schedule that is on now and existed then was due and no check has that `date`, and tapping it opens the form on that date. Settings "Clear my data" must clear every list.
- Events/announcements are static data in `data/events.json` (unique `id`, local `date`, optional `time`, 16:9 `image` in `public/events/`; omit `date` for an ongoing announcement, with an optional `schedule` text like "Weekdays at 5 AM", which stays until removed), read by `lib/events.ts` and shown on Home in the "Events" tab (Home has Dashboard / Events tabs below the latest sermon; Dashboard holds Grow and a random note from the latest sermon) until their date passes (filtered on the device, since Home is prerendered).
- Lists have search (`components/search-field.tsx`, `matchesSearch`: every word must appear) and filter chips (`components/filter-chips.tsx`): sermons by series, church verses by tag, heart checks by date range (default last month). Memory verses keep the order the user drags them into (`@dnd-kit/react` sortable, drag handle per card; disabled while searching). The add/edit form splits the reference into Book + Chapter:verse and uses `components/suggest-input.tsx` (Base UI Autocomplete: pick or type) for book and version, with lists in `lib/bible-books.ts`. Each memory verse has an optional `status` (`new` / `learning` / `memorized`; missing means `new`), set in the form or the view drawer, with status filter chips on the list.
- Church-curated verses are static data in `data/verses.json` (each with a unique `id` and `tags`), read by `lib/verses.ts`. `/memory-verses` is titled "Verses" with two tabs: "Memory Verses" (user-entered) and "Church Verses" (tag filter, save to Memory Verses). `/verses` redirects there.
- Settings: font size (`lib/font-size.ts`; `data-font-size` on `<html>` set before paint by the inline script from `lib/font-size-script.ts`, scaled in `globals.css`) and JSON backup export/import (`lib/backup.ts`; import only adds items whose `id` is new, via `merge` in `createLocalList`). New local lists must be added to the backup and to "Clear my data".
- Install button in Settings uses `lib/install-prompt.ts`; `captureInstallPrompt()` runs on app start from `components/service-worker-register.tsx` because `beforeinstallprompt` fires early.
- PWA: `app/manifest.ts`, icons in `public/icons/` + `app/icon.png`/`app/apple-icon.png`, hand-written service worker `public/sw.js` (registered in production only by `components/service-worker-register.tsx`). Bump `CACHE_VERSION` in `sw.js` when changing precached files.

## Code style

Prettier: no semicolons, double quotes, `trailingComma: "es5"`, 80 columns, LF endings. `prettier-plugin-tailwindcss` sorts classes, including inside `cn(...)` and `cva(...)` calls.
