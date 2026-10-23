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

- App Router only (`app/`). Root `app/layout.tsx` sets fonts (Inter as `--font-sans`, Geist Mono as `--font-mono`) and wraps everything in `ThemeProvider`.
- `components/theme-provider.tsx` wraps `next-themes` (class-based, system default) and adds a global `d` hotkey to toggle dark mode, ignored while typing in inputs.
- UI is shadcn/ui with the `base-vega` style, built on **Base UI** (`@base-ui/react`), not Radix. Add components with `npx shadcn@latest add <name>`; they land in `components/ui/`. Variants use `class-variance-authority`.
- Tailwind CSS v4: no `tailwind.config` file. Theme tokens (oklch CSS variables, light + `.dark`) and `@theme inline` mappings are in `app/globals.css`.
- `cn` comes from the `cn` npm package; `lib/utils.ts` just re-exports it. Generated UI components import from `"cn"` directly.
- Path alias `@/*` maps to the repo root (`@/components`, `@/lib`, `@/hooks`).
- Base UI `Button` with `render={<Link />}` needs `nativeButton={false}`.

## App (Calvary Temple Philippines PWA, deployed on Vercel from `main`)

- Theme tokens in `app/globals.css` come from the logo (navy `#2a0e72`, red `#e91a10`, gold `#e2bd26`, cream `#fffcf3`). Beyond the shadcn tokens there are `gold`, `brand-red` and `hero` (navy banner that stays navy in dark mode, unlike `primary`). Scripture uses `font-serif` (Lora).
- Mobile-app shell: `components/bottom-nav.tsx` (fixed tab bar, rendered in the root layout) and `components/page-header.tsx` (sticky top bar per page). Layouts pad for `env(safe-area-inset-*)`.
- Sermon content is static data in `data/sermons.json`: a flat `sermons` list (each with a unique `slug`, ISO `date`, optional `series` slug) plus a `series` list holding series metadata. A sermon's `content` is an ordered list of typed blocks (`note`, `verse`, `point`, `section`, `declaration`, `text`); `point`/`section` nest their own blocks. `lib/sermons.ts` sorts newest first and derives each sermon's series part number from date order; renderer is `components/sermon-content.tsx`. Pages live at `/sermons/[slug]`, prerendered via `generateStaticParams` with `dynamicParams = false`.
- Verse text is stored in the JSON (`verses: [{ number, text }]`). Copyright notices for NIV/NLT/CEV are on the Settings page; add one there when a new translation is used.
- User data lives only in `localStorage`, via the `createLocalList` helper in `lib/local-list.ts` (`useSyncExternalStore`, cross-tab sync): memory verses (`ctpi:memory-verses`, `lib/memory-verses.ts`) heart checks (`ctpi:heart-check-entries`, `lib/heart-checks.ts`; a 1-3 level self-rating with optional details) and heart check alarms (`ctpi:heart-check-alarms`, `lib/heart-check-alarms.ts`; Samsung-style reminders at `/heart-check/alarms`: `HH:mm` time, repeat weekdays or a one-time date, on/off). Settings "Clear my data" must clear every list.
- Church-curated verses are static data in `data/verses.json` (each with a unique `id` and `tags`), read by `lib/verses.ts` and shown at `/verses` with a tag filter.
- Install button in Settings uses `lib/install-prompt.ts`; `captureInstallPrompt()` runs on app start from `components/service-worker-register.tsx` because `beforeinstallprompt` fires early.
- PWA: `app/manifest.ts`, icons in `public/icons/` + `app/icon.png`/`app/apple-icon.png`, hand-written service worker `public/sw.js` (registered in production only by `components/service-worker-register.tsx`). Bump `CACHE_VERSION` in `sw.js` when changing precached files.

## Code style

Prettier: no semicolons, double quotes, `trailingComma: "es5"`, 80 columns, LF endings. `prettier-plugin-tailwindcss` sorts classes, including inside `cn(...)` and `cva(...)` calls.
