import type { PageServerLoad } from './$types';
import { getCurrentGrade, listProfiles } from '$lib/server/repositories/profiles';
import { getCurrentSchoolYear } from '$lib/server/repositories/schoolYears';

export const load: PageServerLoad = () => {
	const kids = listProfiles()
		.filter((p) => p.role === 'kid')
		.map((kid) => ({ ...kid, grade: getCurrentGrade(kid.id) }));
	return { kids, schoolYear: getCurrentSchoolYear() };
};
