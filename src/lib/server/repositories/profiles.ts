import { getDb } from '../db';

export interface Profile {
	id: number;
	name: string;
	role: 'parent' | 'kid';
	pin_hash: string;
	color: string;
	avatar_emoji: string;
	sort_order: number;
}

export function listProfiles(): Profile[] {
	return getDb().prepare('SELECT * FROM profiles ORDER BY sort_order, id').all() as Profile[];
}

export function getProfile(id: number): Profile | undefined {
	return getDb().prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Profile | undefined;
}

/** A kid's current-year grade, if any (a profile can be a kid with no
 * kid_years row yet, e.g. before school-year setup). */
export function getCurrentGrade(profileId: number): string | undefined {
	const row = getDb()
		.prepare(
			`SELECT ky.grade_level as grade
			 FROM kid_years ky
			 JOIN school_years sy ON sy.id = ky.school_year_id
			 WHERE ky.profile_id = ? AND sy.is_current = 1`
		)
		.get(profileId) as { grade: string } | undefined;
	return row?.grade;
}
