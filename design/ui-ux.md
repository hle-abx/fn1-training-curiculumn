# UI/UX Design

This is the visual and interaction design for the app, written before any
code so the "first shot" — the screen everyone sees the moment the app
opens — gets real thought instead of being whatever falls out of default
component styling.

Devices: kids primarily use a **shared home tablet**, parents primarily
use a **laptop** (planning, editing curriculum, reports) — but kids also
reach for a **phone** for quick, specific checks (the schedule/calendar
being the clear case: "what do I have today/this week"). That's not "the
tablet layout, shrunk" — the calendar in particular gets a real phone
layout, not just a squeezed grid (see §5.0 and §5.6).

---

## 1. Tone & principles

Five very different users share one app: an 8-year-old (Mint, grade 3),
a middle-schooler (Teen, grade 7), a nearly-adult high-schooler (Wind,
grade 10) — plus two parents, who need speed and density. One visual
language has to flex across all of them without feeling babyish to Wind
or overwhelming to Mint.

1. **Warm, not corporate.** This is a family tool, not enterprise SaaS —
   rounded shapes, a friendly (not sterile) palette, plain language
   ("What's due today?" not "Pending Action Items").
2. **One design system, two densities.** Same components, same colors,
   same font everywhere — but **kid mode** uses larger touch targets,
   bigger type, more whitespace and a bit of celebratory motion; **parent
   mode** uses tighter spacing and denser tables. No separate "skin,"
   just a consistent scale turned up or down.
3. **Status is never color-only.** Not-started/in-progress/done always
   pairs an icon + label with the color, so it still reads on a
   colorblind-unfriendly TV-cast screen or a black-and-white printout.
4. **Progress, not gamification.** Plain progress bars/rings and
   "X of Y done" counts — no badges, streak flames, or leaderboards
   (deliberately out of scope per `PLAN.md` §7). Motivating without
   turning learning into a slot machine.
5. **Parents are never more than one tap from a kid's exact view.**
   Whatever a kid sees, either parent can see too (read or edit) — no
   separate "hidden" data model, just permission differences (see
   `PLAN.md` §4). Both parent accounts are equal-weight peers, not a
   primary/secondary pair.

## 2. Working name & wordmark

A generic "Training Curriculum Manager" title undercuts the "first shot
matters" goal. Suggested working name: **Trellis** — a structure that
helps something grow, one line per kid/subject, easy to say, no
trademark conflict in this space. Wordmark: lowercase, rounded,
`🌱 trellis`. Trivial to rename later — it's a string in one config
file, not baked into the data model.

## 3. Visual design system

### Color

Each kid's `profiles.color` gets a real value now, chosen to riff on
their names — a small delight worth the two minutes it takes:

| Profile | Role | Hex | Feel |
|---|---|---|---|
| Wind | kid | `#0EA5E9` (sky blue) | breezy, cool |
| Teen | kid | `#F59E0B` (amber) | energetic |
| Mint | kid | `#3EB489` (mint green) | literal, fresh |
| Cherie | parent | `#7C3AED` (violet) | calm, distinct from kid colors |
| Grumpy | parent | `#475569` (slate) | neutral, calm authority |

Both parent colors are deliberately more muted/adult-toned than the kids' vivid palette, so
the picker screen (§5.1) reads as "kids' cards are the main event, parent
cards are secondary" even with two of them.

Neutrals & status (shared, Tailwind default scale):

| Token | Value | Use |
|---|---|---|
| `bg` | `slate-50` `#F8FAFC` | app background |
| `surface` | `white` | cards |
| `text` | `slate-900` / `slate-600` | primary / secondary text |
| `border` | `slate-200` | dividers, card borders |
| `status-not-started` | `slate-300` + `○` icon | neutral, low-emphasis |
| `status-in-progress` | `amber-500` + `◐` icon | active |
| `status-done` | `emerald-500` + `✓` icon | complete |
| `status-overdue` | `rose-500` + `!` icon | needs attention |

A kid's assigned color tints their header banner, avatar ring, and
active nav item — it's the fastest visual cue for "whose screen is
this," useful since three kids will share one tablet.

### Typography

Two font families, used deliberately rather than decoratively:

- **Inter** — everything by default: body text, parent dashboard, forms,
  tables. Highly legible at small sizes, keeps the dense parent views
  scannable.
- **Baloo 2** (rounded, friendly, free on Google Fonts) — reserved for
  kid-mode page headings and big numbers only (e.g. "3 lessons today!",
  a subject title banner). Never used for body copy or in parent mode.
  Gives kid screens personality without needing a whole second
  component style.

Type scale (Tailwind defaults, applied consistently):

| Context | Size | Weight | Font |
|---|---|---|---|
| Kid-mode page title | `text-3xl`/`4xl` | 700 | Baloo 2 |
| Section heading | `text-xl` | 600 | Inter |
| Body / lesson title | `text-base` | 500 | Inter |
| Secondary/meta text | `text-sm` | 400 | Inter |
| Parent dense table cell | `text-sm` | 400–500 | Inter |

### Shape, spacing, elevation

| Token | Kid mode | Parent mode |
|---|---|---|
| Card radius | `rounded-2xl` (16px) | `rounded-lg` (8px) |
| Card padding | `p-6` | `p-3`/`p-4` |
| Min touch target | 48px | 36px (mouse-driven) |
| Shadow | soft `shadow-md` on interactive cards | flat, border instead of shadow |

### Icons & avatars

- Icon set: **Lucide** (`lucide-svelte`) — matches the rounded-but-clean
  aesthetic, tree-shakeable, MIT licensed.
- Kid avatars: an emoji chosen per kid (`profiles.avatar_emoji`) inside a
  circle filled with their color at 15% opacity, colored ring at full
  opacity — e.g. Wind = 🪁, Teen = 🎧, Mint = 🌿 (placeholders, easy to
  let each kid pick their own on first setup).

### Motion

- Standard transitions: 150–200ms ease-out on hover/tap/expand.
- One deliberate celebratory moment: marking a lesson **done** in kid
  mode gives a short checkmark "pop" (scale 1 → 1.15 → 1, ~250ms) plus a
  brief, subtle confetti burst (`canvas-confetti`, small particle count,
  only in kid mode, only on lesson completion — not on every click).
  Parent mode has no confetti; it's a planning tool, speed matters more
  than delight there.
- Everything respects `prefers-reduced-motion` — confetti and pop
  animations are skipped, a plain color change is the fallback.

## 4. Information architecture

```
/                                          Profile picker (first shot)
/pin/[profileId]                           PIN unlock
/parent                                    Parent dashboard
/parent/kids/[id]                          Kid admin: grade/year, PIN, color
/parent/subjects                           Subjects & Curriculum (two-panel, see §4.1)
/parent/subjects/subject/[subjectId]       Subject detail (rename, assignments list)
/parent/subjects/assignment/[kidSubjectId] Assignment content editor (units/lessons)
/parent/school-years                       School year management
/parent/reports/[kidId]                    Printable report
/parent/calendar                           Weekly planner (all kids)
/kid/[profileId]                           Kid home ("Today / This Week") — right panel default
/kid/[profileId]/subjects                  Subjects list (phone: full-screen; tablet+: unused, see sidebar)
/kid/[profileId]/subjects/[kidSubjectId]   Subject detail (units/lessons) — right panel
/kid/[profileId]/calendar                  Weekly planner (kid-scoped)
```

Kid nav (both Teen and Wind): a persistent **left panel** on tablet/desktop
(see §4.1) listing Today + every assigned subject with a progress
fraction; on phone this collapses to the bottom tab bar from §5.0/§5.3 —
**Today · Subjects · Calendar**. Mint's nav is simplified to two big icon
buttons — **Home** and **My Subjects** — no calendar concept yet at
grade 3; her lessons just show up on Home in the order to do them.

Parent nav: a left sidebar (desktop) collapsing to a top bar (narrow
width) — **Dashboard · Subjects & Curriculum · School Years · Reports**.
"Subjects & Curriculum" is itself a nested two-panel master-detail (§4.1).

### 4.1 Two-panel (master-detail) layout

Both the kid and parent experiences use the same underlying pattern on
tablet/desktop: a **left panel** listing items, a **right panel** showing
whatever's selected. This replaces top-tab navigation with something that
stays visible while you work, and it maps directly onto the data model
(a kid's assigned subjects; a parent's subject → assignment tree).

- **Kid**: left panel = Today (default) + one row per assigned subject
  (color dot, name, `done/total`). Right panel = Today's lesson lists, or
  the selected subject's units/lessons. Implemented as a shared
  `+layout.svelte` at `/kid/[profileId]/` so the left panel persists
  across navigation instead of re-rendering.
- **Parent → Subjects & Curriculum**: left panel = a tree, **Subject →
  its Assignments** (one row per kid it's assigned to). Right panel =
  either that subject's info (rename, category, "assign to a kid") or,
  one level deeper, an assignment's full content editor (units/lessons).
  This is the "listing, popups, and details view" facility from
  `PLAN.md` §7 Phase 1 — see §5.9 below for the full breakdown.

**On phone**, both collapse to a single panel at a time (the standard
master-detail collapse): the list becomes its own full-screen view, and
selecting a row navigates to the detail view with a back affordance,
rather than showing both side by side. This is consistent with, not a
replacement for, the phone-specific Today/Calendar layouts already
designed in §5.0/§5.3/§5.6 — those *are* the "detail panel, shown alone"
state for a kid on phone.

## 5. Screen designs

### 5.0 Breakpoints & device priority

Three Tailwind breakpoints, each with a clear job rather than one layout
mechanically reflowing into another:

| Breakpoint | Width | Primary users/context |
|---|---|---|
| Phone | `< 640px` (below `sm`) | Kids grabbing a **quick answer** on the go — "what's due," schedule check. Short sessions, one-handed, thumb reach. |
| Tablet | `640–1024px` (`sm`–`lg`) | Kids' main working surface — working through lessons, checking things off, reading resources. |
| Desktop | `> 1024px` (`lg`+) | Parents' main working surface — dense dashboard, editing curriculum, reports. |

Per-screen device priority (what actually gets a dedicated phone layout
vs. what just needs to not break):

| Screen | Phone | Tablet | Desktop |
|---|---|---|---|
| Profile picker + PIN | ✅ first-class (see 5.1) | ✅ primary | fine, rarely used here |
| Kid Calendar/Schedule | ✅ **first-class, distinct layout** (see 5.6) | ✅ primary | fine |
| Kid Today/Home | ✅ first-class (see 5.3) | ✅ primary | fine |
| Kid Subject detail | works, single-column | ✅ primary | fine |
| Parent dashboard/editors | works, but not designed for | usable | ✅ primary |
| Report/print view | not a target (print is print) | fine | ✅ primary |

The rule of thumb: any screen a kid might reasonably open on a phone
(picker → PIN → Today or Calendar) gets real phone-specific layout
decisions, not just responsive squeeze. Parent-only screens and the
subject drill-down stay tablet/desktop-first and only need to not visibly
break on a phone.


### 5.1 Profile picker — the first shot

This is the screen that has to land. Full-bleed, calm gradient
background (`slate-50` → white, nothing loud), centered content, no
chrome, no nav — just the wordmark and four cards.

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│                         🌱 trellis                            │
│                 Good afternoon — who's learning?              │
│                                                                │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐               │
│   │    🪁     │   │    🎧     │   │    🌿     │               │
│   │  (sky ring)│  │(amber ring)│  │(mint ring)│               │
│   │   Wind    │   │   Teen    │   │   Mint    │               │
│   │ 2 due today│  │ all caught│   │ 1 due today│              │
│   └───────────┘   └───────────┘   └───────────┘               │
│                                                                │
│              ┌───────────┐     ┌───────────┐                  │
│              │    👩     │     │    👨     │                  │
│              │  (violet) │     │  (slate)  │                  │
│              │  Cherie   │     │  Grumpy   │                  │
│              └───────────┘     └───────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

Details that matter here:

- Greeting is time-of-day aware ("Good morning/afternoon/evening") —
  cheap to compute client-side, makes the app feel alive rather than
  static.
- Each kid card shows one live, honest signal — a due-today count or
  "all caught up" — pulled from real data, not decoration. This is the
  single most useful thing the picker screen can surface at a glance.
- Kids get the large, primary row; the two parent cards sit in a smaller,
  secondary row below — muted colors, no "due today" chip — so kids
  aren't drawn to tap them, without hiding or locking either one. Both
  parent cards are equal-weight with each other (no primary/secondary
  parent).
- Cards use a gentle lift on hover/focus (`shadow-md`, translate-y -2px)
  and a press-down effect on tap, so it's obvious they're touchable on a
  tablet even before a PIN pad appears.
- Tapping a card doesn't navigate away — the PIN pad slides up as an
  overlay on the *same* screen (see 5.2), keeping the transition fast
  and avoiding a jarring full-page reload feel.

**Phone (`< 640px`):** the two rows become one vertical stack, kid cards
first, still full-width and tall enough to stay one-handed-tappable
(not shrunk into a grid of small squares):

```
┌───────────────────────┐
│      🌱 trellis        │
│  Good afternoon —      │
│  who's learning?       │
│ ┌─────────────────────┐│
│ │ 🪁  Wind             ││
│ │     2 due today      ││
│ └─────────────────────┘│
│ ┌─────────────────────┐│
│ │ 🎧  Teen             ││
│ │     all caught up    ││
│ └─────────────────────┘│
│ ┌─────────────────────┐│
│ │ 🌿  Mint             ││
│ │     1 due today      ││
│ └─────────────────────┘│
│ ┌──────────┐┌──────────┐│
│ │ 👩 Cherie ││ 👨 Grumpy ││
│ └──────────┘└──────────┘│
└───────────────────────┘
```

The two parent cards stay side-by-side even on phone (they're compact
and secondary) rather than each taking a full-width row — keeps the
"kids are the main event" hierarchy intact at every width.

### 5.2 PIN unlock (overlay)

```
┌──────────────────────────────────────────────────────────────┐
│   ← back                                                      │
│                                                                │
│              🪁  Hi Wind! Enter your PIN                      │
│                                                                │
│                   ● ● ○ ○                                     │
│                                                                │
│           ┌────┐  ┌────┐  ┌────┐                              │
│           │ 1  │  │ 2  │  │ 3  │                               │
│           └────┘  └────┘  └────┘                              │
│           ┌────┐  ┌────┐  ┌────┐                              │
│           │ 4  │  │ 5  │  │ 6  │                               │
│           └────┘  └────┘  └────┘                              │
│           ┌────┐  ┌────┐  ┌────┐                              │
│           │ 7  │  │ 8  │  │ 9  │                               │
│           └────┘  └────┘  └────┘                              │
│                   ┌────┐  ┌────┐                               │
│                   │ 0  │  │ ⌫  │                                │
│                   └────┘  └────┘                                │
└──────────────────────────────────────────────────────────────┘
```

- Big numeric keypad (48px+ buttons), tinted with the selected profile's
  color for continuity from the picker.
- Wrong PIN: dots do a short horizontal shake, clear, no error text
  needed (a 4-digit mis-tap doesn't need an alert-level message).
- Correct PIN: dots fill solid, brief fade to the destination screen —
  no separate "Welcome!" interstitial, get them to content fast.

### 5.3 Kid home — "Today"

```
┌──────────────────────────────────────────────────────────────┐
│  🪁 Wind                                    Today  Subjects  Calendar │
│  ▓▓▓▓▓▓▓▓░░░░░░░░  4 of 10 done this week                     │
├──────────────────────────────────────────────────────────────┤
│  Today                                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ○  Competitive Programming            CS50 Week 3        │  │
│  │    Algorithms: sorting, Big-O          🔗 open resource   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ ◐  Math                          Fractions review        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  This week                                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✓  Competitive Programming     CS50 Week 2   (Wed)       │  │
│  │ ○  Piano                       Scale practice (Fri)      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Header banner tinted in the kid's color; the week progress bar is the
  one persistent "gamified-adjacent" element, and it's deliberately
  plain (a bar and a fraction, no streaks/points).
- Lesson rows: tapping the status icon cycles
  not-started → in-progress → done directly, no extra dialog for the
  common case; tapping the row body (not the icon) opens the lesson
  detail panel for notes/link/description.
- Subject name shown as a small colored tag per lesson so a mixed list
  (academic + skill subjects together) stays scannable.
- Mint's version of this screen drops the "This week" section, the
  progress bar becomes a simple row of dots (filled = done), and lesson
  rows are larger with subject icons instead of text tags where
  possible.

**Phone:** the `Today  Subjects  Calendar` top nav moves to a **bottom
tab bar** (thumb reach, standard mobile placement), the header banner
compresses to a single line (avatar + name + progress bar, no extra
padding), and "This week" collapses under a tap ("+ 6 more this week")
rather than showing inline — a phone visit here is almost always "what's
due right now," not a full week review:

```
┌───────────────────────┐
│ 🪁 Wind      ▓▓▓░░ 4/10│
├───────────────────────┤
│ Today                  │
│ ┌───────────────────┐ │
│ │○ Competitive Prog. │ │
│ │  CS50 Week 3    🔗 │ │
│ ├───────────────────┤ │
│ │◐ Math              │ │
│ │  Fractions review  │ │
│ └───────────────────┘ │
│  + 6 more this week    │
├───────────────────────┤
│  Today   Subjects  Cal │
└───────────────────────┘
```
### 5.4 Subject detail (units & lessons)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Subjects        Competitive Programming        12/45 done  │
│                     ◔ progress ring                            │
├──────────────────────────────────────────────────────────────┤
│  ▸ Unit 1 — Programming Fundamentals (CS50x)      9/9 ✓ done  │
│  ▾ Unit 2 — Math Foundations                       3/6         │
│      ✓  2.1 Algebra I/II review            🔗                 │
│      ✓  2.2 Precalculus: sequences         🔗                 │
│      ◐  2.3 Cryptography: modular math     🔗   notes »       │
│      ○  2.4 MIT 6.042J Part I                                 │
│      ○  2.5 MIT 6.042J Part II                                │
│      ○  2.6 MIT 6.042J Part III                               │
│  ▸ Unit 3 — Algorithms & Data Structures Core     0/8 (next)  │
│  ▸ Unit 4 — Intro to CP Practice                  0/5          │
│  …                                                             │
└──────────────────────────────────────────────────────────────┘
```

- Completed units collapse by default (title + ✓ done count); the
  current in-progress unit auto-expands; future units show collapsed
  with a muted "next" label — visually suggestive of order without a
  hard lock, matching the self-paced, non-punitive tone.
- Each lesson row: status icon (tap to cycle, kid mode) or dropdown
  (parent mode, since parent also sets score), title, 🔗 icon if
  `resource_url` is set (opens in new tab), a small "notes »" affordance
  if notes exist.
- Parent mode adds a score chip on completed lessons (e.g. `92%` or
  `Pass`) and an edit (pencil) icon per row/unit for CRUD.

### 5.5 Parent dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ trellis          Dashboard  Kids  Subjects  School Years  Reports │
├──────────────────────────────────────────────────────────────┤
│  This week, all kids                                          │
│  ┌──────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐           │
│  │      │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │           │
│  ├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤           │
│  │ Wind │  ✓  │  ✓  │  ◐  │  ○  │  ○  │     │     │           │
│  │ Teen │  ✓  │  !  │  ○  │  ○  │     │     │     │           │
│  │ Mint │  ✓  │  ✓  │  ✓  │  ○  │  ○  │     │     │           │
│  └──────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘           │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ 🪁 Wind      │  │ 🎧 Teen      │  │ 🌿 Mint      │            │
│  │ Grade 10     │  │ Grade 7      │  │ Grade 3      │            │
│  │ 3 subjects   │  │ 2 subjects   │  │ 4 subjects   │            │
│  │ 12/45 CP     │  │ 0/45 CP      │  │ —            │            │
│  │ Manage →     │  │ Manage →     │  │ Manage →     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

- The weekly grid is the highest-value glance for a parent juggling
  three kids: one dot per day per kid, `!` in rose for overdue. Clicking
  a cell jumps to that kid's calendar day.
- Kid summary cards are compact (parent density: tight padding, small
  radius, no shadow — bordered instead).

### 5.6 Calendar / weekly planner

This is the screen most likely to get opened on a kid's phone — a quick
"what do I have today/this week" between other activities — so it gets a
genuinely different layout per breakpoint rather than one grid that
squishes down.

**Tablet/desktop:** standard 7-column week grid; lessons render as small
colored chips (colored by subject, not by kid, since this view is
usually single-kid-scoped) stacked in their due-date column. Parent's
all-kids variant adds a kid-color left-border stripe on each chip.
Click a chip → lesson detail panel. (Drag-to-reschedule is a Phase 3+
stretch, not required for the first version of this screen.)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Today          Wind's schedule            ‹ Sep 15–21 ›    │
├──────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────────────┤
│      │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun                 │
│      │ 15  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21                  │
├──────┼─────┼─────┼─────┼─────┼─────┼─────┼─────────────────────┤
│      │▓CP  │▓Math│▓CP  │     │▓CP  │     │                     │
│      │     │     │▓Pia │     │     │     │                     │
└──────┴─────┴─────┴─────┴─────┴─────┴─────┴─────────────────────┘
```

**Phone (`< 640px`):** a 7-column grid doesn't fit — each column would be
too narrow to show anything useful. Instead: a horizontally-scrollable
**day-picker strip** (7 date pills, today highlighted, swipe or tap to
change day) above a single-day **agenda list**, which is really just the
Today-view lesson list scoped to whatever day is selected instead of
always "today." This reuses the same `LessonRow` component as the Today
screen — the calendar isn't a different data view on phone, just a
different day-selector on top of the same row list.

```
┌───────────────────────┐
│ ← Wind's schedule       │
│ ┌──┬──┬──┬──┬──┬──┬──┐ │
│ │Mo│Tu│●We│Th│Fr│Sa│Su│ │
│ │15│16│ 17│18│19│20│21│ │
│ └──┴──┴──┴──┴──┴──┴──┘ │
│  Wed, Sep 17            │
│ ┌───────────────────┐ │
│ │○ Competitive Prog. │ │
│ │  CS50 Week 3    🔗 │ │
│ ├───────────────────┤ │
│ │○ Piano             │ │
│ │  Scale practice    │ │
│ └───────────────────┘ │
├───────────────────────┤
│  Today   Subjects  Cal │
└───────────────────────┘
```

A day with no lessons shows the same friendly empty state as an empty
subject ("Nothing due — enjoy the day!") rather than a blank grid cell,
which matters more here than on the grid view since it's the only thing
on screen.

### 5.7 Report / print view

Print-optimized, black-and-white-safe (status shown as icon+label, not
color fill):

```
Wind — Grade 10 — School Year 2026–2027              printed 2026-09-20
────────────────────────────────────────────────────────────────
Competitive Programming                              12 / 45 done
  Unit 1 — Programming Fundamentals (CS50x)            9 / 9  ✓
  Unit 2 — Math Foundations                            3 / 6
    ✓ 2.1 Algebra I/II review .......................... Pass
    ✓ 2.2 Precalculus: sequences ....................... Pass
    ◐ 2.3 Cryptography: modular math
    ○ 2.4 MIT 6.042J Part I
    ...
────────────────────────────────────────────────────────────────
```

Uses Tailwind's `print:` variants to hide nav/chrome and force light
background + black text regardless of on-screen theme.

### 5.8 Parent editor forms (subjects/units/lessons)

Quick single-item edits (rename a subject, tweak a unit's title) happen
inline, in place, on whatever list/detail row they belong to — no
navigation. Anything that creates a new item (a subject, an assignment, a
unit, a lesson) opens as a **popup (modal dialog)** instead of a
slide-over — simpler to reason about, and it matches the pattern used
throughout §5.9 below.

### 5.9 Parent: Subjects & Curriculum (listing + popups + details view)

This is the facility for setting up **what** each kid is studying — the
subject → assignment → content hierarchy from `PLAN.md` §3, exposed as
one two-panel screen (`/parent/subjects`, see §4.1).

**Left panel — the tree (listing):** every subject in the catalog, each
with its assignments nested underneath as one row per kid it's given to:

```
┌─────────────────────────┐
│ Subjects            +Add │
├─────────────────────────┤
│ Competitive Programming  │
│   🪁 Wind        13/45   │
│   🎧 Teen         0/45   │
│ Math                     │
│   Not assigned yet       │
│ Chess                    │
│   Not assigned yet       │
└─────────────────────────┘
```

Clicking a **subject** row opens its info in the right panel; clicking an
**assignment** row (a kid under a subject) opens that assignment's full
content editor. "+ Add" opens the add-subject popup.

**Popups:** Add subject (name, category), Assign to a kid (pick kid →
resolves to that kid's current-year `kid_year_id`, optional display-name
override), Add unit (title, description), Add lesson (title,
description, resource URL, due date), Edit lesson (adds status/score/
notes — parent can override what a kid set). Every destructive action
(delete a unit, a lesson, an assignment, a subject) asks for confirmation
first, since deletes cascade to everything nested under them.

**Right panel — subject detail:** subject name/category (inline-editable),
delete (blocked with a clear message if it still has assignments — the
schema has no cascade there on purpose, see `schema.sql`), and the list
of kids it's assigned to with an "assign to a kid" popup trigger.

**Right panel — assignment detail (the "content" view):** header (kid +
subject + overall progress), then each unit as a card: title/description,
edit/delete, "+ lesson", and its lessons as rows (status icon, title, due
date, score, edit/delete). This is the same shape as the kid-facing
Subject detail screen (§5.4) but editable — reusing that layout rather
than inventing a second one.

## 6. Component inventory

`ProfileCard`, `PinPad`, `KidHeaderBanner`, `ProgressBar` /
`ProgressRing`, `LessonRow` (with `StatusToggle` and `ScoreBadge`),
`UnitAccordion`, `SubjectTag`, `WeekGridCell`, `KidSummaryCard`,
`CalendarChip`, `Modal` (the popup shell used throughout §5.9),
`SubjectTree` (left-panel listing, kid- and parent-facing variants),
`TwoPanelLayout` (the persistent left/right shell from §4.1),
`EmptyState`, `Toast`.

## 7. States

- **Empty**: a subject with no units yet shows a friendly icon + "No
  units yet" with an "Add a unit" CTA (parent) or "Check back soon!"
  (kid, no CTA).
- **Loading**: skeleton rows matching the shape of `LessonRow` (not a
  generic spinner) so layout doesn't jump.
- **Error**: a dismissible toast, plain language ("Couldn't save that —
  try again"), never a raw error dump in kid mode.
- **Success/celebration**: the pop + confetti described in §3, kid mode
  only, on lesson completion; unit completion gets a slightly bigger
  version (more confetti particles, still brief).

## 8. Accessibility

- Text contrast meets WCAG AA against all backgrounds, including tinted
  header banners (verify tint opacity keeps white text ≥ 4.5:1).
- Status always icon + label, never color alone (see §1.3).
- All interactive targets ≥ 44px in kid mode; PIN pad buttons are large
  enough for an 8-year-old's motor control.
- Full keyboard navigation and visible focus rings in parent mode
  (forms, tables).
- Confetti/motion respects `prefers-reduced-motion`.

## 9. Open questions / assumptions to confirm

- Device priority confirmed: tablet/laptop primary, phone first-class
  specifically for picker/PIN, Today, and Calendar (§5.0). If more
  screens turn out to need real phone layouts later, revisit §5.0's
  table rather than bolting on ad-hoc breakpoints screen-by-screen.
- "Trellis" is a placeholder name/wordmark — say the word if you'd
  rather keep it generic or have a different name in mind.
- Kid avatar emoji (🪁/🎧/🌿) are placeholders; real choice can be left
  to each kid during first-run setup rather than fixed here.
