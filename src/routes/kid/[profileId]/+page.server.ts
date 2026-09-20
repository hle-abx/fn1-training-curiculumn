import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { canAccessKidProfile } from '$lib/server/authorize';
import { cycleLessonStatus, getLessonsDueBetween, getWeekProgress } from '$lib/server/repositories/lessons';
import { todayIso, weekRangeIso } from '$lib/utils/date';

// Auth is enforced by the parent +layout.server.ts load; this page just
// needs its own data.
export const load: PageServerLoad = ({ params }) => {
	const profileId = Number(params.profileId);
	const today = todayIso();
	const { start, end } = weekRangeIso(today);
	const weekLessons = getLessonsDueBetween(profileId, start, end);
	const todayLessons = weekLessons.filter((l) => l.due_date === today);
	const restOfWeek = weekLessons.filter((l) => l.due_date !== today);
	const progress = getWeekProgress(profileId, start, end);

	return { todayLessons, restOfWeek, progress };
};

export const actions: Actions = {
	toggle: async ({ request, params, cookies }) => {
		const profileId = Number(params.profileId);
		if (!canAccessKidProfile(cookies, profileId)) throw redirect(303, '/');

		const form = await request.formData();
		const lessonId = Number(form.get('lessonId'));
		cycleLessonStatus(lessonId);
		return { success: true };
	}
};
