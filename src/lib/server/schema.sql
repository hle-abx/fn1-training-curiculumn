-- Trellis — SQLite schema. Mirrors design/schema.sql; see that file and
-- design/PLAN.md for the rationale behind each table.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	name         TEXT NOT NULL,
	role         TEXT NOT NULL CHECK (role IN ('parent', 'kid')),
	pin_hash     TEXT NOT NULL,
	color        TEXT NOT NULL,
	avatar_emoji TEXT NOT NULL,
	sort_order   INTEGER NOT NULL DEFAULT 0,
	created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS school_years (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	label      TEXT NOT NULL UNIQUE,
	start_date TEXT NOT NULL,
	end_date   TEXT NOT NULL,
	is_current INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kid_years (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	profile_id     INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	school_year_id INTEGER NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
	grade_level    TEXT NOT NULL,
	notes          TEXT,
	UNIQUE (profile_id, school_year_id)
);

CREATE TABLE IF NOT EXISTS subjects_catalog (
	id        INTEGER PRIMARY KEY AUTOINCREMENT,
	name      TEXT NOT NULL UNIQUE,
	category  TEXT NOT NULL CHECK (category IN ('academic', 'skill')),
	is_preset INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kid_subjects (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	kid_year_id    INTEGER NOT NULL REFERENCES kid_years(id) ON DELETE CASCADE,
	subject_id     INTEGER NOT NULL REFERENCES subjects_catalog(id),
	display_name   TEXT,
	color          TEXT,
	sort_order     INTEGER NOT NULL DEFAULT 0,
	UNIQUE (kid_year_id, subject_id)
);

CREATE TABLE IF NOT EXISTS units (
	id             INTEGER PRIMARY KEY AUTOINCREMENT,
	kid_subject_id INTEGER NOT NULL REFERENCES kid_subjects(id) ON DELETE CASCADE,
	title          TEXT NOT NULL,
	description    TEXT,
	sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	unit_id      INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
	title        TEXT NOT NULL,
	description  TEXT,
	resource_url TEXT,
	notes        TEXT,
	due_date     TEXT,
	status       TEXT NOT NULL DEFAULT 'not_started'
	               CHECK (status IN ('not_started', 'in_progress', 'done')),
	score_value  TEXT,
	score_type   TEXT CHECK (score_type IN ('percent', 'letter', 'pass_fail')),
	completed_at TEXT,
	sort_order   INTEGER NOT NULL DEFAULT 0,
	created_at   TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lessons_due_date      ON lessons(due_date);
CREATE INDEX IF NOT EXISTS idx_lessons_unit          ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_units_kid_subject     ON units(kid_subject_id);
CREATE INDEX IF NOT EXISTS idx_kid_subjects_kid_year ON kid_subjects(kid_year_id);
CREATE INDEX IF NOT EXISTS idx_kid_years_profile     ON kid_years(profile_id);
