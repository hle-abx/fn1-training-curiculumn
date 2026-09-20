import { getDb } from '../db';

export type SubjectCategory = 'academic' | 'skill';

export interface SubjectCatalogRow {
	id: number;
	name: string;
	category: SubjectCategory;
	is_preset: number;
}

export function listSubjectsCatalog(): SubjectCatalogRow[] {
	return getDb().prepare('SELECT * FROM subjects_catalog ORDER BY category, name').all() as SubjectCatalogRow[];
}

export function getSubject(id: number): SubjectCatalogRow | undefined {
	return getDb().prepare('SELECT * FROM subjects_catalog WHERE id = ?').get(id) as SubjectCatalogRow | undefined;
}

export function createSubject(name: string, category: SubjectCategory): number {
	const info = getDb()
		.prepare('INSERT INTO subjects_catalog (name, category, is_preset) VALUES (?, ?, 0)')
		.run(name, category);
	return info.lastInsertRowid as number;
}

export function updateSubject(id: number, name: string, category: SubjectCategory): void {
	getDb().prepare('UPDATE subjects_catalog SET name = ?, category = ? WHERE id = ?').run(name, category, id);
}

/** Throws (SQLite FK constraint) if any kid_subjects row still references
 * this subject — deletion is intentionally not cascaded here, unlike
 * unit/lesson deletion, so a subject in active use can't vanish silently. */
export function deleteSubject(id: number): void {
	getDb().prepare('DELETE FROM subjects_catalog WHERE id = ?').run(id);
}

export interface AssignmentRow {
	id: number; // kid_subjects.id
	kid_profile_id: number;
	kid_name: string;
	kid_avatar_emoji: string;
	kid_color: string;
	grade_level: string;
	subject_id: number;
	subject_name: string;
	display_name: string | null;
	color: string | null;
	unit_count: number;
	lesson_count: number;
	lessons_done: number;
}

const ASSIGNMENT_SELECT = `
	SELECT
		ks.id, p.id as kid_profile_id, p.name as kid_name, p.avatar_emoji as kid_avatar_emoji, p.color as kid_color,
		ky.grade_level, sc.id as subject_id, sc.name as subject_name, ks.display_name, ks.color,
		COUNT(DISTINCT u.id) as unit_count,
		COUNT(l.id) as lesson_count,
		COALESCE(SUM(CASE WHEN l.status = 'done' THEN 1 ELSE 0 END), 0) as lessons_done
	FROM kid_subjects ks
	JOIN kid_years ky ON ky.id = ks.kid_year_id
	JOIN profiles p ON p.id = ky.profile_id
	JOIN subjects_catalog sc ON sc.id = ks.subject_id
	LEFT JOIN units u ON u.kid_subject_id = ks.id
	LEFT JOIN lessons l ON l.unit_id = u.id
`;

export function listAssignments(): AssignmentRow[] {
	return getDb()
		.prepare(`${ASSIGNMENT_SELECT} GROUP BY ks.id ORDER BY sc.name, p.sort_order`)
		.all() as AssignmentRow[];
}

export function listAssignmentsForKid(profileId: number): AssignmentRow[] {
	return getDb()
		.prepare(`${ASSIGNMENT_SELECT} WHERE p.id = ? GROUP BY ks.id ORDER BY sc.name`)
		.all(profileId) as AssignmentRow[];
}

export function listAssignmentsForSubject(subjectId: number): AssignmentRow[] {
	return getDb()
		.prepare(`${ASSIGNMENT_SELECT} WHERE sc.id = ? GROUP BY ks.id ORDER BY p.sort_order`)
		.all(subjectId) as AssignmentRow[];
}

export function getAssignment(kidSubjectId: number): AssignmentRow | undefined {
	return getDb()
		.prepare(`${ASSIGNMENT_SELECT} WHERE ks.id = ? GROUP BY ks.id`)
		.get(kidSubjectId) as AssignmentRow | undefined;
}

export function getCurrentSchoolYearId(): number | undefined {
	const row = getDb().prepare('SELECT id FROM school_years WHERE is_current = 1 LIMIT 1').get() as
		| { id: number }
		| undefined;
	return row?.id;
}

export function getKidYearId(profileId: number, schoolYearId: number): number | undefined {
	const row = getDb()
		.prepare('SELECT id FROM kid_years WHERE profile_id = ? AND school_year_id = ?')
		.get(profileId, schoolYearId) as { id: number } | undefined;
	return row?.id;
}

/** Throws (UNIQUE constraint) if this subject is already assigned to this kid_year. */
export function createAssignment(
	kidYearId: number,
	subjectId: number,
	displayName?: string,
	color?: string
): number {
	const db = getDb();
	const maxSort = db
		.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as n FROM kid_subjects WHERE kid_year_id = ?')
		.get(kidYearId) as { n: number };
	const info = db
		.prepare(
			'INSERT INTO kid_subjects (kid_year_id, subject_id, display_name, color, sort_order) VALUES (?, ?, ?, ?, ?)'
		)
		.run(kidYearId, subjectId, displayName || null, color || null, maxSort.n);
	return info.lastInsertRowid as number;
}

/** Cascades to units and lessons (schema.sql ON DELETE CASCADE). */
export function deleteAssignment(kidSubjectId: number): void {
	getDb().prepare('DELETE FROM kid_subjects WHERE id = ?').run(kidSubjectId);
}
