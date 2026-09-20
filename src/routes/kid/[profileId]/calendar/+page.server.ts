import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { canAccessKidProfile } from '$lib/server/authorize';
import { cycleLessonStatus, getLessonsDueBetween, type LessonRow } from '$lib/server/repositories/lessons';
import { addDaysIso, isoRange, todayIso, weekRangeIso } from '$lib/utils/date';

export const load: PageServerLoad = ({ params, url }) => {
	const profileId = Number(params.profileId);
	const anchor = url.searchParams.get('week') ?? todayIso();
	const { start, end } = weekRangeIso(anchor);
	const days = isoRange(start, end);

	const lessons = getLessonsDueBetween(profileId, start, end);
	const byDate: Record<string, LessonRow[]> = {};
	for (const d of days) byDate[d] = [];
	for (const lesson of lessons) {
		if (lesson.due_date && byDate[lesson.due_date]) byDate[lesson.due_date].push(lesson);
	}

	return {
		days,
		byDate,
		start,
		end,
		prevWeek: addDaysIso(start, -7),
		nextWeek: addDaysIso(start, 7),
		today: todayIso()
	};
};

export const actions: Actions = {
	toggle: async ({ request, params, cookies }) => {
		const profileId = Number(params.profileId);
		if (!canAccessKidProfile(cookies, profileId)) throw redirect(303, '/');

		const form = await request.formData();
		cycleLessonStatus(Number(form.get('lessonId')));
		return { success: true };
	}
};
