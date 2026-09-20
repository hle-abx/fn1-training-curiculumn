import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve to <repo root>/db/curriculum.sqlite3 regardless of cwd, so the
// same path works whether this runs from `vite dev`, a built server, or
// the migrate/seed scripts run directly via tsx.
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const DB_PATH = join(projectRoot, 'db', 'curriculum.sqlite3');

if (!existsSync(dirname(DB_PATH))) {
	mkdirSync(dirname(DB_PATH), { recursive: true });
}

let instance: Database.Database | undefined;

/** Shared, lazily-created connection. SQLite + WAL is plenty for a single-machine home app. */
export function getDb(): Database.Database {
	if (!instance) {
		instance = new Database(DB_PATH);
		instance.pragma('journal_mode = WAL');
		instance.pragma('foreign_keys = ON');
	}
	return instance;
}
