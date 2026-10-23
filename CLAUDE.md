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

## Code style

Prettier: no semicolons, double quotes, `trailingComma: "es5"`, 80 columns, LF endings. `prettier-plugin-tailwindcss` sorts classes, including inside `cn(...)` and `cva(...)` calls.
