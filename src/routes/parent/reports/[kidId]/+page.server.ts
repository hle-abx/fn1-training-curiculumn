import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCurrentGrade, getProfile } from '$lib/server/repositories/profiles';
import { getCurrentSchoolYear } from '$lib/server/repositories/schoolYears';
import { listAssignmentsForKid } from '$lib/server/repositories/subjects';
import { getUnitsWithLessons } from '$lib/server/repositories/lessons';

export const load: PageServerLoad = ({ params }) => {
	const kidId = Number(params.kidId);
	const kid = getProfile(kidId);
	if (!kid || kid.role !== 'kid') throw error(404, 'Kid not found');

	const assignments = listAssignmentsForKid(kidId).map((a) => ({
		...a,
		units: getUnitsWithLessons(a.id)
	}));

	return {
		kid,
		grade: getCurrentGrade(kidId),
		schoolYear: getCurrentSchoolYear(),
		assignments,
		printedAt: new Date().toISOString().slice(0, 10)
	};
};
