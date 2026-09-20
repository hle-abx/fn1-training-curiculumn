# fn1-training-curiculumn

**trellis** — a home app for planning and tracking the training curriculum
for 3 kids across subjects, grades, and school years. SvelteKit + Tailwind
CSS + a SQLite file in this repo (via `better-sqlite3`).

See [`design/PLAN.md`](design/PLAN.md) for the full design (data model,
architecture, roadmap) and [`design/ui-ux.md`](design/ui-ux.md) for the
visual/interaction design.

## Setup

```sh
npm install
npm run db:seed   # creates db/curriculum.sqlite3, migrates, and seeds it
npm run dev
```

`db:seed` prints a generated 4-digit PIN for each profile (Wind, Teen,
Mint, Cherie, Grumpy) — use those to unlock a profile from the picker at
`http://localhost:5173`. PINs are hashed at rest; only ever shown once,
right after seeding.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run preview` | Production build / preview it |
| `npm run check` | Type-check (`svelte-check`) |
| `npm run db:migrate` | Apply the schema (idempotent) |
| `npm run db:seed` | Seed profiles/curriculum data (no-ops if profiles already exist) |
| `npm run db:reset` | Delete the DB file and re-migrate + re-seed from scratch |

## What's implemented so far

- **Data layer**: full schema (`src/lib/server/schema.sql`), migration and
  seed scripts. Seed data: 2 parent profiles (Cherie, Grumpy) + 3 kids
  (Wind/10, Teen/7, Mint/3), the 2026-2027 school year, the starter
  subject catalog, and the full **Competitive Programming** curriculum
  (8 units / 45 lessons, sourced from Harvard CS50x, MIT OCW, Khan
  Academy, Coursera, USACO Guide, CSES, Codeforces, AtCoder) assigned to
  Wind and Teen — see
  [`design/curriculum-competitive-programming.md`](design/curriculum-competitive-programming.md).
- **Profile picker** (`/`) — the "first shot" screen from the UI/UX
  design: kid cards with live due-today counts, parent cards, PIN pad
  overlay, PINs verified server-side (`scrypt`-hashed, never stored in
  plaintext).
- **Kid two-panel shell** (`/kid/[id]`, `design/ui-ux.md` §4.1) — a
  persistent left panel (Today, Calendar + every assigned subject with a
  progress fraction) on tablet/desktop; collapses to a top header + a
  bottom tab bar (**Today · Subjects · Calendar**) on phone. Right panel:
  **Today** (this/that week's lessons, tap-to-cycle status, resource
  links, scores), a **Subject detail** view (units as accordions, same
  tap-to-cycle status), or **Calendar** (`/kid/[id]/calendar`) — a
  7-column week grid on tablet/desktop, a day-picker strip + single-day
  agenda list on phone (design/ui-ux.md §5.6), with prev/next week
  navigation.
- **Parent dashboard** (`/parent`) — weekly status grid across all 3
  kids, per-kid summary cards linking into their Today view.
- **Parent: Subjects & Curriculum** (`/parent/subjects`,
  `design/ui-ux.md` §5.9) — the two-panel listing/popup/details-view
  facility for setting up curriculum: left panel is a subject → assignment
  tree; right panel is either a subject's info (rename, category, delete —
  blocked with a clear error while it still has assignments) or an
  assignment's full content editor (units and lessons, with popups to add
  a subject, assign it to a kid, and add/edit/delete units and lessons).
  Destructive actions ask for confirmation first.
- **Parent: Calendar** (`/parent/calendar`) — all 3 kids' weeks side by
  side, each linking into that kid's full calendar.
- **Parent: Reports** (`/parent/reports`, `/parent/reports/[kidId]`) — a
  printable, per-school-year summary (subjects → units → lessons, status
  icon+label, scores) with a Print button; the parent shell's header/nav
  hide via `print:` variants so only the report prints.
- **Icons**: all interface chrome (nav, status, buttons, links) uses
  [`@lucide/svelte`](https://lucide.dev) rather than emoji/unicode glyphs;
  kid/parent **avatar emoji** are intentionally left as-is since they're a
  personalization field (`profiles.avatar_emoji`), not system iconography.
- **Auth**: a session cookie set on successful PIN entry; a kid can only
  reach their own page, either parent can reach any page (see
  `design/ui-ux.md` §1.5). Parent routes are gated by a shared
  `/parent/+layout.server.ts`; kid routes by `/kid/[id]/+layout.server.ts`.

## Not yet built

Parent-side school-year management (`/parent/school-years`) and kid admin
(`/parent/kids/[id]` — grade/PIN/color editing) are the remaining IA
routes from `design/PLAN.md` that don't have a screen yet. Drag-to-
reschedule on the calendar and CSV export for reports are noted as
stretch goals in the design docs, not required for v1.
