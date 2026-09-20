import { getDb } from '../db';
import { todayIso } from '$lib/utils/date';

export type LessonStatus = 'not_started' | 'in_progress' | 'done';

export interface LessonRow {
	id: number;
	title: string;
	description: string | null;
	resource_url: string | null;
	notes: string | null;
	due_date: string | null;
	status: LessonStatus;
	score_value: string | null;
	score_type: string | null;
	unit_title: string;
	subject_name: string;
}

const LESSON_SELECT = `
	SELECT
		l.id, l.title, l.description, l.resource_url, l.notes, l.due_date,
		l.status, l.score_value, l.score_type,
		u.title AS unit_title,
		sc.name AS subject_name
	FROM lessons l
	JOIN units u ON u.id = l.unit_id
	JOIN kid_subjects ks ON ks.id = u.kid_subject_id
	JOIN kid_years ky ON ky.id = ks.kid_year_id
	JOIN subjects_catalog sc ON sc.id = ks.subject_id
	WHERE ky.profile_id = ?
`;

export function getLessonsDueBetween(profileId: number, startIso: string, endIso: string): LessonRow[] {
	return getDb()
		.prepare(`${LESSON_SELECT} AND l.due_date BETWEEN ? AND ? ORDER BY l.due_date, l.sort_order`)
		.all(profileId, startIso, endIso) as LessonRow[];
}

/** Due today and not yet done — the "quick answer" the picker/Today screens surface. */
export function countDueToday(profileId: number, isoDate: string = todayIso()): number {
	const row = getDb()
		.prepare(
			`SELECT COUNT(*) as n
			 FROM lessons l
			 JOIN units u ON u.id = l.unit_id
			 JOIN kid_subjects ks ON ks.id = u.kid_subject_id
			 JOIN kid_years ky ON ky.id = ks.kid_year_id
			 WHERE ky.profile_id = ? AND l.due_date = ? AND l.status != 'done'`
		)
		.get(profileId, isoDate) as { n: number };
	return row.n;
}

export function getWeekProgress(
	profileId: number,
	startIso: string,
	endIso: string
): { done: number; total: number } {
	const row = getDb()
		.prepare(
			`SELECT
				COALESCE(SUM(CASE WHEN l.status = 'done' THEN 1 ELSE 0 END), 0) as done,
				COUNT(*) as total
			 FROM lessons l
			 JOIN units u ON u.id = l.unit_id
			 JOIN kid_subjects ks ON ks.id = u.kid_subject_id
			 JOIN kid_years ky ON ky.id = ks.kid_year_id
			 WHERE ky.profile_id = ? AND l.due_date BETWEEN ? AND ?`
		)
		.get(profileId, startIso, endIso) as { done: number; total: number };
	return row;
}

export interface DaySummary {
	total: number;
	done: number;
	overdue: number;
	inProgress: number;
}

/** Per-day rollup for a date range, keyed by ISO date — used for the
 * parent dashboard's weekly grid (one status dot per kid per day). */
export function getDailySummaries(
	profileId: number,
	startIso: string,
	endIso: string,
	todayForOverdueCheck: string = todayIso()
): Record<string, DaySummary> {
	const rows = getDb()
		.prepare(
			`SELECT
				l.due_date as date,
				COUNT(*) as total,
				SUM(CASE WHEN l.status = 'done' THEN 1 ELSE 0 END) as done,
				SUM(CASE WHEN l.status != 'done' AND l.due_date < ? THEN 1 ELSE 0 END) as overdue,
				SUM(CASE WHEN l.status = 'in_progress' THEN 1 ELSE 0 END) as inProgress
			 FROM lessons l
			 JOIN units u ON u.id = l.unit_id
			 JOIN kid_subjects ks ON ks.id = u.kid_subject_id
			 JOIN kid_years ky ON ky.id = ks.kid_year_id
			 WHERE ky.profile_id = ? AND l.due_date BETWEEN ? AND ?
			 GROUP BY l.due_date`
		)
		.all(todayForOverdueCheck, profileId, startIso, endIso) as (DaySummary & { date: string })[];

	const map: Record<string, DaySummary> = {};
	for (const r of rows) {
		map[r.date] = { total: r.total, done: r.done, overdue: r.overdue, inProgress: r.inProgress };
	}
	return map;
}

export type DayDotStatus = 'none' | 'overdue' | 'done' | 'in_progress' | 'not_started';

export function dayDotStatus(summary: DaySummary | undefined): DayDotStatus {
	if (!summary || summary.total === 0) return 'none';
	if (summary.overdue > 0) return 'overdue';
	if (summary.done === summary.total) return 'done';
	if (summary.inProgress > 0) return 'in_progress';
	return 'not_started';
}

export function getLessonSubjectCount(profileId: number): number {
	const row = getDb()
		.prepare(
			`SELECT COUNT(*) as n
			 FROM kid_subjects ks
			 JOIN kid_years ky ON ky.id = ks.kid_year_id
			 WHERE ky.profile_id = ?`
		)
		.get(profileId) as { n: number };
	return row.n;
}

/** not_started -> in_progress -> done -> not_started */
export function cycleLessonStatus(lessonId: number): LessonStatus {
	const db = getDb();
	const lesson = db.prepare('SELECT status FROM lessons WHERE id = ?').get(lessonId) as
		| { status: LessonStatus }
		| undefined;
	if (!lesson) throw new Error(`Lesson ${lessonId} not found`);

	const next: LessonStatus =
		lesson.status === 'not_started' ? 'in_progress' : lesson.status === 'in_progress' ? 'done' : 'not_started';
	const completedAt = next === 'done' ? new Date().toISOString() : null;

	db.prepare(
		`UPDATE lessons SET status = ?, completed_at = ?, updated_at = datetime('now') WHERE id = ?`
	).run(next, completedAt, lessonId);

	return next;
}

export function updateLessonNotes(lessonId: number, notes: string): void {
	getDb()
		.prepare(`UPDATE lessons SET notes = ?, updated_at = datetime('now') WHERE id = ?`)
		.run(notes, lessonId);
}

// ---------------------------------------------------------------------------
// Kid-side subject nav (left panel, design/ui-ux.md §4.1)
// ---------------------------------------------------------------------------

export interface KidSubjectNavItem {
	id: number; // kid_subjects.id
	name: string;
	color: string | null;
	total: number;
	done: number;
}

export function listKidSubjects(profileId: number): KidSubjectNavItem[] {
	return getDb()
		.prepare(
			`SELECT
				ks.id,
				COALESCE(ks.display_name, sc.name) as name,
				ks.color,
				COUNT(l.id) as total,
				COALESCE(SUM(CASE WHEN l.status = 'done' THEN 1 ELSE 0 END), 0) as done
			 FROM kid_subjects ks
			 JOIN kid_years ky ON ky.id = ks.kid_year_id
			 JOIN subjects_catalog sc ON sc.id = ks.subject_id
			 LEFT JOIN units u ON u.kid_subject_id = ks.id
			 LEFT JOIN lessons l ON l.unit_id = u.id
			 WHERE ky.profile_id = ?
			 GROUP BY ks.id
			 ORDER BY ks.sort_order`
		)
		.all(profileId) as KidSubjectNavItem[];
}

// ---------------------------------------------------------------------------
// Content management (parent CRUD: units & lessons within an assignment) —
// design/ui-ux.md §5.9
// ---------------------------------------------------------------------------

export interface ContentLesson {
	id: number;
	title: string;
	description: string | null;
	resource_url: string | null;
	due_date: string | null;
	status: LessonStatus;
	score_value: string | null;
	score_type: string | null;
	notes: string | null;
	sort_order: number;
}

export interface UnitWithLessons {
	id: number;
	title: string;
	description: string | null;
	sort_order: number;
	lessons: ContentLesson[];
}

export function getUnitsWithLessons(kidSubjectId: number): UnitWithLessons[] {
	const db = getDb();
	const units = db
		.prepare('SELECT id, title, description, sort_order FROM units WHERE kid_subject_id = ? ORDER BY sort_order')
		.all(kidSubjectId) as Omit<UnitWithLessons, 'lessons'>[];
	const lessonStmt = db.prepare(
		`SELECT id, title, description, resource_url, due_date, status, score_value, score_type, notes, sort_order
		 FROM lessons WHERE unit_id = ? ORDER BY sort_order`
	);
	return units.map((u) => ({ ...u, lessons: lessonStmt.all(u.id) as ContentLesson[] }));
}

export function createUnit(kidSubjectId: number, title: string, description: string): number {
	const db = getDb();
	const maxSort = db
		.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as n FROM units WHERE kid_subject_id = ?')
		.get(kidSubjectId) as { n: number };
	const info = db
		.prepare('INSERT INTO units (kid_subject_id, title, description, sort_order) VALUES (?, ?, ?, ?)')
		.run(kidSubjectId, title, description || null, maxSort.n);
	return info.lastInsertRowid as number;
}

export function updateUnit(id: number, title: string, description: string): void {
	getDb().prepare('UPDATE units SET title = ?, description = ? WHERE id = ?').run(title, description || null, id);
}

/** Cascades to its lessons (schema.sql ON DELETE CASCADE). */
export function deleteUnit(id: number): void {
	getDb().prepare('DELETE FROM units WHERE id = ?').run(id);
}

export interface LessonFields {
	title: string;
	description?: string;
	resourceUrl?: string;
	dueDate?: string;
	notes?: string;
	status?: LessonStatus;
	scoreValue?: string;
	scoreType?: string;
}

export function createLesson(unitId: number, fields: LessonFields): number {
	const db = getDb();
	const maxSort = db
		.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as n FROM lessons WHERE unit_id = ?')
		.get(unitId) as { n: number };
	const info = db
		.prepare(
			`INSERT INTO lessons (unit_id, title, description, resource_url, due_date, notes, sort_order)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			unitId,
			fields.title,
			fields.description || null,
			fields.resourceUrl || null,
			fields.dueDate || null,
			fields.notes || null,
			maxSort.n
		);
	return info.lastInsertRowid as number;
}

export function updateLesson(id: number, fields: LessonFields): void {
	const completedAt = fields.status === 'done' ? new Date().toISOString() : null;
	getDb()
		.prepare(
			`UPDATE lessons SET
				title = ?, description = ?, resource_url = ?, due_date = ?, notes = ?,
				status = ?, score_value = ?, score_type = ?, completed_at = ?, updated_at = datetime('now')
			 WHERE id = ?`
		)
		.run(
			fields.title,
			fields.description || null,
			fields.resourceUrl || null,
			fields.dueDate || null,
			fields.notes || null,
			fields.status || 'not_started',
			fields.scoreValue || null,
			fields.scoreType || null,
			completedAt,
			id
		);
}

export function deleteLesson(id: number): void {
	getDb().prepare('DELETE FROM lessons WHERE id = ?').run(id);
}
