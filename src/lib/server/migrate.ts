import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db';

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), 'schema.sql');

export function migrate(): void {
	const db = getDb();
	const schema = readFileSync(schemaPath, 'utf-8');
	db.exec(schema);
}

// Allow running directly: `tsx src/lib/server/migrate.ts`
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	migrate();
	console.log(`Migrated schema -> db/curriculum.sqlite3`);
}
