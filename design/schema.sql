-- Training Curriculum Manager — SQLite schema (draft v1)
-- Lives at: db/curriculum.sqlite3 (created/updated by a migration script,
-- see design/PLAN.md "Architecture" section)

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- One row per family member who can have a profile: both parents (admins)
-- and each of the 3 kids. All profiles unlock with a 4-digit PIN. Nothing
-- here restricts how many rows have role = 'parent' -- two parent accounts
-- (or more) is just two rows, not a schema change.
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
  pin_hash      TEXT NOT NULL,             -- hashed 4-digit PIN (never plaintext)
  color         TEXT,                      -- UI accent color, e.g. '#7c3aed'
  avatar_emoji  TEXT,                      -- e.g. '🦊'
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- A school year, shared across the whole family (e.g. "2026-2027").
-- ---------------------------------------------------------------------------
CREATE TABLE school_years (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL UNIQUE,        -- '2026-2027'
  start_date  TEXT NOT NULL,               -- ISO date
  end_date    TEXT NOT NULL,
  is_current  INTEGER NOT NULL DEFAULT 0   -- 1 for the active year (only one)
);

-- ---------------------------------------------------------------------------
-- Ties a kid to a grade level within a specific school year. This is what
-- lets a kid's grade change year over year while keeping prior years intact.
-- ---------------------------------------------------------------------------
CREATE TABLE kid_years (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id      INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_year_id  INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  grade_level     TEXT NOT NULL,           -- '10', '7', '3', 'K', etc. (text, not int)
  notes           TEXT,
  UNIQUE (profile_id, school_year_id)
);

-- ---------------------------------------------------------------------------
-- Catalog of subjects — presets shipped with the app, plus custom ones you
-- add. Shared across the family; a subject only becomes "real" for a kid
-- once assigned via kid_subjects below.
-- ---------------------------------------------------------------------------
CREATE TABLE subjects_catalog (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,        -- 'Math', 'Piano', 'Chess'
  category    TEXT NOT NULL CHECK (category IN ('academic', 'skill')),
  is_preset   INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- A subject as assigned to one kid for one school year. This row is the
-- actual "subject x grade x person" combination the curriculum hangs off.
-- ---------------------------------------------------------------------------
CREATE TABLE kid_subjects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_year_id   INTEGER NOT NULL REFERENCES kid_years(id) ON DELETE CASCADE,
  subject_id    INTEGER NOT NULL REFERENCES subjects_catalog(id),
  display_name  TEXT,                      -- optional override, e.g. 'Algebra I'
  color         TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  UNIQUE (kid_year_id, subject_id)
);

-- ---------------------------------------------------------------------------
-- A unit/topic within a kid's subject for that year (e.g. "Fractions").
-- ---------------------------------------------------------------------------
CREATE TABLE units (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_subject_id  INTEGER NOT NULL REFERENCES kid_subjects(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- A single lesson/assignment within a unit — the finest-grained trackable
-- item: has a status, an optional due date, an optional score, and an
-- optional link + notes.
-- ---------------------------------------------------------------------------
CREATE TABLE lessons (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id       INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  resource_url  TEXT,                      -- link to video/worksheet/site
  notes         TEXT,                      -- freeform notes (parent or kid)
  due_date      TEXT,                      -- ISO date, nullable
  status        TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'done')),
  score_value   TEXT,                      -- '92%', 'A-', 'Pass' — free text
  score_type    TEXT CHECK (score_type IN ('percent', 'letter', 'pass_fail')),
  completed_at  TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_lessons_due_date       ON lessons(due_date);
CREATE INDEX idx_lessons_unit           ON lessons(unit_id);
CREATE INDEX idx_units_kid_subject      ON units(kid_subject_id);
CREATE INDEX idx_kid_subjects_kid_year  ON kid_subjects(kid_year_id);
CREATE INDEX idx_kid_years_profile      ON kid_years(profile_id);

-- ---------------------------------------------------------------------------
-- Seed data sketch (see design/PLAN.md for the full seeding plan)
-- ---------------------------------------------------------------------------
-- INSERT INTO profiles (name, role, pin_hash, ...) VALUES
--   ('Cherie',  'parent', '<hash>', ...),
--   ('Grumpy',  'parent', '<hash>', ...),
--   ('Wind', 'kid',    '<hash>', ...),
--   ('Teen', 'kid',    '<hash>', ...),
--   ('Mint', 'kid',    '<hash>', ...);
--
-- INSERT INTO school_years (label, start_date, end_date, is_current) VALUES
--   ('2026-2027', '2026-08-15', '2027-06-15', 1);
--
-- kid_years: Wind -> grade '10', Teen -> grade '7', Mint -> grade '3',
-- all against the 2026-2027 school year.
--
-- subjects_catalog also includes ('Competitive Programming', 'skill', 1).
-- kid_subjects: one row for Wind's kid_year and one for Teen's kid_year,
-- both pointing at 'Competitive Programming' -- separate rows so each
-- kid's units/lessons/progress are independent even though it's the same
-- catalog subject. Full unit/lesson breakdown (8 units, 45 lessons per
-- kid, all sourced from free open courses -- Harvard CS50x, MIT OCW
-- 6.006/6.042J, Khan Academy, Coursera Princeton Algorithms, USACO Guide,
-- CSES, Codeforces, AtCoder) is designed in full in
-- design/curriculum-competitive-programming.md and should be used as the
-- literal INSERT content for units/lessons when the seed script is built.
