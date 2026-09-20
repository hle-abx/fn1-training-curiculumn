import { randomInt } from 'node:crypto';
import { getDb } from './db';
import { migrate } from './migrate';
import { hashPin } from './auth';
import { COMPETITIVE_PROGRAMMING_UNITS } from './seed-data/competitive-programming';
import { addDaysIso, todayIso } from '../utils/date';

interface ProfileSeed {
	name: string;
	role: 'parent' | 'kid';
	color: string;
	avatarEmoji: string;
}

// Colors/avatars per design/ui-ux.md §3. Real names per the family
// (design/PLAN.md §2) — "Cherie"/"Grumpy" for the parents.
const PROFILES: ProfileSeed[] = [
	{ name: 'Wind', role: 'kid', color: '#0EA5E9', avatarEmoji: '🪁' },
	{ name: 'Teen', role: 'kid', color: '#F59E0B', avatarEmoji: '🎧' },
	{ name: 'Mint', role: 'kid', color: '#3EB489', avatarEmoji: '🌿' },
	{ name: 'Cherie', role: 'parent', color: '#7C3AED', avatarEmoji: '👩' },
	{ name: 'Grumpy', role: 'parent', color: '#475569', avatarEmoji: '👨' }
];

const STARTER_SUBJECTS: { name: string; category: 'academic' | 'skill' }[] = [
	{ name: 'Math', category: 'academic' },
	{ name: 'Reading/ELA', category: 'academic' },
	{ name: 'Science', category: 'academic' },
	{ name: 'History/Social Studies', category: 'academic' },
	{ name: 'Writing', category: 'academic' },
	{ name: 'Foreign Language', category: 'academic' },
	{ name: 'Music', category: 'skill' },
	{ name: 'Sports', category: 'skill' },
	{ name: 'Coding', category: 'skill' },
	{ name: 'Art', category: 'skill' },
	{ name: 'Chess', category: 'skill' },
	{ name: 'Competitive Programming', category: 'skill' }
];

const SCHOOL_YEAR = { label: '2026-2027', start_date: '2026-08-15', end_date: '2027-06-15' };

const KID_GRADES: Record<string, string> = { Wind: '10', Teen: '7', Mint: '3' };

function isoDate(daysFromToday: number): string {
	return addDaysIso(todayIso(), daysFromToday);
}

function generatePin(): string {
	return String(randomInt(0, 10000)).padStart(4, '0');
}

function seed(): void {
	migrate();
	const db = getDb();

	const existing = db.prepare('SELECT COUNT(*) AS n FROM profiles').get() as { n: number };
	if (existing.n > 0) {
		console.log('Database already has profiles — skipping seed. Delete db/curriculum.sqlite3 (or run `npm run db:reset`) to reseed from scratch.');
		return;
	}

	const pins: Record<string, string> = {};

	const insertProfile = db.prepare(
		`INSERT INTO profiles (name, role, pin_hash, color, avatar_emoji, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
	);
	const insertSchoolYear = db.prepare(
		`INSERT INTO school_years (label, start_date, end_date, is_current) VALUES (?, ?, ?, 1)`
	);
	const insertKidYear = db.prepare(
		`INSERT INTO kid_years (profile_id, school_year_id, grade_level) VALUES (?, ?, ?)`
	);
	const insertSubject = db.prepare(
		`INSERT INTO subjects_catalog (name, category, is_preset) VALUES (?, ?, 1)`
	);
	const insertKidSubject = db.prepare(
		`INSERT INTO kid_subjects (kid_year_id, subject_id, sort_order) VALUES (?, ?, ?)`
	);
	const insertUnit = db.prepare(
		`INSERT INTO units (kid_subject_id, title, description, sort_order) VALUES (?, ?, ?, ?)`
	);
	const insertLesson = db.prepare(
		`INSERT INTO lessons (unit_id, title, description, resource_url, sort_order) VALUES (?, ?, ?, ?, ?)`
	);
	const updateLessonProgress = db.prepare(
		`UPDATE lessons SET due_date = ?, status = ?, score_value = ?, score_type = ?, completed_at = ? WHERE id = ?`
	);

	const seedTxn = db.transaction(() => {
		// --- Profiles ---------------------------------------------------
		const profileIds: Record<string, number> = {};
		PROFILES.forEach((p, i) => {
			const pin = generatePin();
			pins[p.name] = pin;
			const info = insertProfile.run(p.name, p.role, hashPin(pin), p.color, p.avatarEmoji, i);
			profileIds[p.name] = info.lastInsertRowid as number;
		});

		// --- School year --------------------------------------------------
		const syInfo = insertSchoolYear.run(SCHOOL_YEAR.label, SCHOOL_YEAR.start_date, SCHOOL_YEAR.end_date);
		const schoolYearId = syInfo.lastInsertRowid as number;

		// --- Kid years (grade per kid per school year) ---------------------
		const kidYearIds: Record<string, number> = {};
		for (const [name, grade] of Object.entries(KID_GRADES)) {
			const info = insertKidYear.run(profileIds[name], schoolYearId, grade);
			kidYearIds[name] = info.lastInsertRowid as number;
		}

		// --- Subject catalog -----------------------------------------------
		const subjectIds: Record<string, number> = {};
		for (const s of STARTER_SUBJECTS) {
			const info = insertSubject.run(s.name, s.category);
			subjectIds[s.name] = info.lastInsertRowid as number;
		}

		// --- Competitive Programming, assigned to Wind and Teen -------------
		// (see design/curriculum-competitive-programming.md for the full
		// rationale — both start as complete beginners with independent
		// kid_subjects rows so their progress tracks separately.)
		for (const kidName of ['Wind', 'Teen']) {
			const kidSubjectInfo = insertKidSubject.run(
				kidYearIds[kidName],
				subjectIds['Competitive Programming'],
				0
			);
			const kidSubjectId = kidSubjectInfo.lastInsertRowid as number;

			const lessonIds: number[] = [];
			COMPETITIVE_PROGRAMMING_UNITS.forEach((unit, unitIndex) => {
				const unitInfo = insertUnit.run(kidSubjectId, unit.title, unit.description, unitIndex);
				const unitId = unitInfo.lastInsertRowid as number;
				unit.lessons.forEach((lesson, lessonIndex) => {
					const lessonInfo = insertLesson.run(
						unitId,
						lesson.title,
						lesson.description ?? null,
						lesson.resourceUrl ?? null,
						lessonIndex
					);
					lessonIds.push(lessonInfo.lastInsertRowid as number);
				});
			});

			if (kidName === 'Wind') {
				// Wind is further along: seed due dates on the first 16 lessons
				// (units 1-2 plus the start of unit 3), one per day ending
				// today, so the Today/This-week/picker views have real data to
				// show. Lesson at index 10 is deliberately left "in_progress"
				// past its due date to demonstrate the overdue treatment.
				const start = -13;
				lessonIds.slice(0, 16).forEach((id, i) => {
					const dueDate = isoDate(start + i);
					const isPast = start + i < 0;
					const isToday = start + i === 0;
					const overdueDemo = i === 10;
					const status = overdueDemo ? 'in_progress' : isPast ? 'done' : isToday ? 'in_progress' : 'not_started';
					const scored = status === 'done' && i % 2 === 0;
					const scoreValue = scored ? (i % 4 === 0 ? 'Pass' : `${88 + i}%`) : null;
					const scoreType = scored ? (i % 4 === 0 ? 'pass_fail' : 'percent') : null;
					const completedAt = status === 'done' ? `${dueDate}T16:00:00` : null;
					updateLessonProgress.run(dueDate, status, scoreValue, scoreType, completedAt, id);
				});
			}
			// Teen hasn't started yet: all lessons stay not_started with no
			// due date, matching the "complete beginner, starting at Unit 1"
			// assignment in the design doc.
		}
	});

	seedTxn();

	console.log('Seeded db/curriculum.sqlite3\n');
	console.log('Generated PINs (change these later — they are also hashed at rest):');
	for (const p of PROFILES) {
		console.log(`  ${p.name.padEnd(8)} ${pins[p.name]}`);
	}
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
	seed();
}

export { seed };
