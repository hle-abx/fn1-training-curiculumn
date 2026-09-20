# Training Curriculum Manager — Design Plan

A home app for two parents to plan and track the training curriculum for
3 kids (**Wind**, grade 10; **Teen**, grade 7; **Mint**, grade 3),
covering both academic subjects (school-style, by grade) and
skill/activity training (music, sports, coding, etc.), stored in a
SQLite file inside this repo.

This document captures the decisions made so far, the data model, the
architecture, and a phased build roadmap. Assumptions that weren't
explicitly confirmed are called out so they're easy to revisit.

---

## 1. Decisions summary

| Topic | Decision |
|---|---|
| Framework | Svelte + Tailwind + Vite, upgraded to **SvelteKit** (still Vite under the hood) so we get server routes to talk to SQLite directly, instead of a separate API server or in-browser WASM SQLite. |
| Users | **Two parent accounts** (both full admin) **and** the 3 kids each use the app. |
| Domain | **Both** academic subjects (tied to grade level) and skill/activity training (not grade-bound, e.g. piano, chess). |
| Granularity | Subjects → **Units** → **Lessons**. Lessons are the finest-grained, schedulable, trackable item. |
| Auth | No heavyweight auth — a **profile picker with a 4-digit PIN per kid** (see §4 for the parent-PIN assumption). |
| Scheduling | Lessons can carry a **due date**; there's a calendar/weekly-planner view of what's due. |
| Progress | Each lesson has a **status** (not started / in progress / done) **and** an optional **score/grade** field. |
| School years | Grade level is tracked **per school year**, so advancing a grade doesn't erase history. |
| Subjects source | **Predefined starter list + custom** subjects you can add. |
| Resources | Lessons can carry a **link** (video/worksheet/site) plus a **notes** field. |
| Reporting | **Basic export/printable report** per kid per school year (subjects, lessons completed, scores). |

## 2. People (seed data)

**Parents** — both accounts are full admins with identical permissions
(no primary/secondary distinction).

| Name | Role |
|---|---|
| Cherie | parent |
| Grumpy | parent |

**Kids**

| Name | Grade | School year | Competitive Programming? |
|---|---|---|---|
| Wind | 10 | 2026-2027 | Yes — complete beginner |
| Teen | 7 | 2026-2027 | Yes — complete beginner |
| Mint | 3 | 2026-2027 | Not yet |

Grade is stored as text (not integer) so values like `K` or `Pre-K` work
for younger siblings in future years without a schema change.

## 3. Data model

Entity relationship, in words:

```
profiles (2 parents + 3 kids)
  └─ kid_years (profile x school_year → grade_level)
       └─ kid_subjects (kid_year x subjects_catalog → the actual curriculum line)
            └─ units (topics within that subject/year)
                 └─ lessons (schedulable, trackable, scorable items)

school_years (shared, e.g. "2026-2027")
subjects_catalog (shared: presets + custom, e.g. "Math", "Piano")
```

This directly encodes the requirement that curriculum is a combination of
**subject × grade × person**: a `kid_subjects` row only exists because a
specific subject was assigned to a specific kid's specific school-year
(which carries that kid's grade for that year).

Full DDL: see [`schema.sql`](./schema.sql). Key tables:

- `profiles` — 2 parent accounts + 3 kids, each with a PIN, color, avatar
  emoji. `role` is `'parent'` or `'kid'`; nothing restricts how many
  rows can have `role = 'parent'`, so a second (or third) parent account
  is just another row, not a schema change.
- `school_years` — e.g. `2026-2027`, one flagged `is_current`.
- `kid_years` — grade level per kid per school year.
- `subjects_catalog` — shared subject list (presets + custom), tagged
  `academic` or `skill`.
- `kid_subjects` — a subject assigned to one kid for one school year.
- `units` — topics within a `kid_subjects` row.
- `lessons` — individual lessons/assignments: title, description,
  `resource_url`, `notes`, `due_date`, `status`, `score_value`,
  `score_type`, timestamps.

### Suggested starter subjects (seed, editable later)

- Academic: Math, Reading/ELA, Science, History/Social Studies, Writing,
  Foreign Language
- Skill: Music, Sports, Coding, Art, Chess, **Competitive Programming**

**Competitive Programming** has a fully detailed curriculum already
designed — see [`curriculum-competitive-programming.md`](./curriculum-competitive-programming.md).
It's assigned to **Wind (10)** and **Teen (7)**, each starting from
complete-beginner, with 8 units / 45 lessons built entirely from free,
open courses: Harvard CS50x, MIT OCW 6.006 & 6.042J, Khan Academy
(incl. the Khan x Dartmouth Algorithms course), Coursera's Princeton
Algorithms Part I/II, and practice platforms (USACO Guide, CSES,
Codeforces, AtCoder). This is the first subject with real (non-placeholder)
seed content and should be used as the reference example when building
the seed script in Phase 0.

## 4. Auth & profiles — assumption to confirm

You confirmed **"simple PIN per kid"** for access control, but didn't
specify whether parents also need a PIN-protected admin view (vs. an
always-open admin mode), or whether the two parent accounts differ in
permissions. This plan assumes, for symmetry and so a kid on a shared
tablet can't wander into subject/unit editing:

- **Both parent profiles** are PIN-protected and identical in
  permissions — full CRUD over profiles (including each other's and the
  kids'), school years, subjects, units, lessons, and scores. No
  primary/secondary parent distinction.
- **Kid profiles** are PIN-protected and can: view their own subjects,
  units, and lessons; toggle a lesson's **status**; edit a lesson's
  **notes**. They **cannot** edit due dates, scores, or the
  subject/unit structure — those stay parent-only, so a kid can't
  grade their own work.

Flag this if you'd rather have an always-open parent mode, differentiate
the two parent accounts' permissions, or let kids self-score.

PINs are stored as hashes (`pin_hash`), never plaintext, even though this
is a low-stakes home app.

## 5. Architecture

- **SvelteKit** (file-based routing, server `load`/actions/`+server.ts`
  endpoints run in Node) + **Tailwind CSS** for styling. Vite remains the
  dev server/bundler underneath — no functional loss from the original
  Svelte+Vite ask, just SvelteKit's conventions on top.
- **better-sqlite3** as the driver, used only in server-side code
  (`src/lib/server/`) — the SQLite file never touches the browser.
- A thin **repository layer** (`src/lib/server/repositories/*.ts`) wraps
  raw SQL per entity (profiles, subjects, units, lessons, reports) so
  route files stay declarative. Plain SQL is enough at this scale;
  an ORM (e.g. Drizzle) is optional polish, not required for MVP.
- A **migration script** (`src/lib/server/migrate.ts`) applies
  `design/schema.sql`-equivalent DDL to `db/curriculum.sqlite3` on first
  run, and a **seed script** inserts both parent profiles (Cherie, Grumpy) +
  Wind/Teen/Mint + the current school year.
- Runs locally via `npm run dev`; since it's a real Node server (not a
  static SPA), it's also reachable from other devices on the home network
  (e.g. a kid's tablet) via the machine's LAN IP, which the PIN-per-kid
  design anticipates.

### Proposed folder structure

```
fn1-training-curiculumn/
├── design/
│   ├── PLAN.md
│   └── schema.sql
├── db/
│   └── curriculum.sqlite3        # gitignored; generated by migrate+seed
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db.ts             # better-sqlite3 singleton connection
│   │   │   ├── migrate.ts        # applies schema, idempotent
│   │   │   ├── seed.ts           # inserts 2 parents + 3 kids + starter subjects
│   │   │   └── repositories/
│   │   │       ├── profiles.ts
│   │   │       ├── schoolYears.ts
│   │   │       ├── subjects.ts
│   │   │       ├── units.ts
│   │   │       ├── lessons.ts
│   │   │       └── reports.ts
│   │   ├── components/           # ProfileCard, LessonRow, StatusBadge, ...
│   │   ├── stores/                # active profile, active school year
│   │   └── utils/                 # date helpers, score formatting
│   ├── routes/
│   │   ├── +layout.svelte         # global chrome, Tailwind entry
│   │   ├── +page.svelte           # profile picker / PIN unlock
│   │   ├── parent/
│   │   │   ├── +page.svelte       # dashboard: all kids, what's due
│   │   │   ├── kids/[id]/+page.svelte
│   │   │   ├── school-years/+page.svelte
│   │   │   ├── subjects/+page.svelte
│   │   │   └── reports/[kidId]/+page.svelte
│   │   └── kid/[profileId]/
│   │       ├── +page.svelte       # today / this week
│   │       ├── calendar/+page.svelte
│   │       └── subjects/[kidSubjectId]/+page.svelte
│   └── app.css                    # Tailwind directives
├── static/
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 6. Core screens

1. **Profile picker** (`/`) — avatar grid for Cherie/Grumpy/Wind/Teen/Mint, PIN
   pad on tap.
2. **Parent dashboard** (`/parent`) — cross-kid "what's due this week" list,
   quick links into each kid's subjects, quick-add lesson.
3. **Kid two-panel shell** (`/kid/[id]`) — persistent left panel (Today +
   assigned subjects with progress); right panel shows Today's lists or a
   selected subject's units/lessons (see `design/ui-ux.md` §4.1).
4. **Kid subject view** (`/kid/[id]/subjects/[kidSubjectId]`) — units
   expandable into lesson checklists with status toggle, link, notes.
5. **Calendar/weekly planner** (`/kid/[id]/calendar` and a parent-wide
   variant) — lessons grouped by due date.
6. **Parent: Subjects & Curriculum** (`/parent/subjects`) — two-panel
   master-detail: left = subject → assignment tree (listing); right =
   subject info or an assignment's content editor (units/lessons), with
   popups for adding a subject, assigning it to a kid, and adding
   units/lessons. This is the parent-facing "listing, popups, details
   view" facility for setting up what each kid studies — see
   `design/ui-ux.md` §5.9 for the full breakdown.
7. **Report view** (`/parent/reports/[kidId]`) — per school-year summary
   (subjects → units → lessons, status, scores), styled for browser print
   to PDF.

## 7. Roadmap

**Phase 0 — Scaffolding**
SvelteKit + Tailwind + better-sqlite3 project setup; `migrate.ts` +
`seed.ts` producing `db/curriculum.sqlite3` with both parent profiles
(Cherie, Grumpy), Wind (10), Teen (7), Mint (3), the 2026-2027 school year, and
the starter subjects list — including the full Competitive Programming
curriculum (8 units / 45 lessons each) assigned to Wind and Teen, per
[`curriculum-competitive-programming.md`](./curriculum-competitive-programming.md).

**Phase 1 — Parent CRUD**
Build the Subjects & Curriculum two-panel facility (`/parent/subjects`,
`design/ui-ux.md` §5.9): subject catalog listing + add-subject popup,
assignment listing (subject → kid) + assign popup, and per-assignment
content editor (units/lessons) with add/edit/delete popups. *(Landed
ahead of schedule alongside the two-panel layout — see the app itself.)*

**Phase 2 — Kid experience & PIN auth** ✅ *landed*
Profile picker with PIN unlock (hashed PINs). Kid view: see own subjects
→ units → lessons, toggle status. (Notes editing from the kid side is
still open — see §8.)

**Phase 3 — Scheduling** ✅ *landed*
Due dates on lessons (seeded + parent-editable via §5.9); weekly
planner/calendar view per kid (`/kid/[id]/calendar`, grid on
tablet/desktop, day-picker + agenda on phone) and a lightweight
all-kids version (`/parent/calendar`). The parent dashboard's weekly
status grid covers the "due this week/overdue" cross-kid view.

**Phase 4 — Scoring & reporting** ✅ *landed*
Parent score entry per lesson (`score_value` + `score_type`, via the
Subjects & Curriculum lesson-edit popup); printable per-kid,
per-school-year report page (`/parent/reports/[kidId]`) with
print-friendly Tailwind styles (chrome hidden via `print:` variants,
status always icon+label so it survives black-and-white printing).

**Phase 5 — Polish** (partial)
Per-kid color themes landed (profile colors drive banners/borders/rings
throughout); all interface icons use `@lucide/svelte` rather than
emoji/unicode. Still open: a dedicated tablet/phone responsiveness pass
beyond the layouts already designed, empty/loading state polish, and
tests around the repository layer and PIN auth.

**Explicitly out of scope for now** (revisit later if wanted): push
notifications/reminders, sync beyond the home LAN, file uploads (links
only for now), recurring-lesson templates, gamification/streaks.

## 8. Open questions / assumptions to revisit

- Parent-PIN assumption (§4) — confirm or change to always-open admin mode.
- Whether the two parent accounts should ever differ in permissions
  (current assumption: identical, full admin for both).
- Whether kids should be allowed to self-report a score, or scores stay
  strictly parent-entered (current assumption: parent-only).
- Exact preset subject list — starter list in §3 is a guess; adjust freely
  once you're in the subjects editor.
- Report export format — plan assumes browser print-to-PDF is sufficient
  for v1; a real CSV/PDF export library can be added in Phase 4 if not.
- Kid-side lesson notes editing (§4's "kids can... edit a lesson's notes")
  isn't built yet — kids can view/toggle status but notes are currently
  parent-only, via the Subjects & Curriculum lesson-edit popup.
