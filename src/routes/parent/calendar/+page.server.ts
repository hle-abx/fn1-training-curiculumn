import type { PageServerLoad } from './$types';
import { listProfiles } from '$lib/server/repositories/profiles';
import { getLessonsDueBetween, type LessonRow } from '$lib/server/repositories/lessons';
import { addDaysIso, isoRange, todayIso, weekRangeIso } from '$lib/utils/date';

export const load: PageServerLoad = ({ url }) => {
	const anchor = url.searchParams.get('week') ?? todayIso();
	const { start, end } = weekRangeIso(anchor);
	const days = isoRange(start, end);

	const kids = listProfiles()
		.filter((p) => p.role === 'kid')
		.map((kid) => {
			const lessons = getLessonsDueBetween(kid.id, start, end);
			const byDate: Record<string, LessonRow[]> = {};
			for (const d of days) byDate[d] = [];
			for (const lesson of lessons) {
				if (lesson.due_date && byDate[lesson.due_date]) byDate[lesson.due_date].push(lesson);
			}
			return { ...kid, byDate };
		});

	return {
		kids,
		days,
		start,
		end,
		prevWeek: addDaysIso(start, -7),
		nextWeek: addDaysIso(start, 7),
		today: todayIso()
	};
};
