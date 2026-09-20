import type { PageServerLoad } from './$types';
import { getCurrentGrade, listProfiles } from '$lib/server/repositories/profiles';
import {
	countDueToday,
	dayDotStatus,
	getDailySummaries,
	getLessonSubjectCount,
	getWeekProgress
} from '$lib/server/repositories/lessons';
import { isoRange, todayIso, weekRangeIso, weekdayLabel } from '$lib/utils/date';

// Auth is enforced by +layout.server.ts; this page just needs its own data.
export const load: PageServerLoad = () => {
	const today = todayIso();
	const { start, end } = weekRangeIso(today);
	const days = isoRange(start, end);

	const kids = listProfiles()
		.filter((p) => p.role === 'kid')
		.map((kid) => {
			const summaries = getDailySummaries(kid.id, start, end, today);
			const week = days.map((d) => ({
				date: d,
				label: weekdayLabel(d),
				status: dayDotStatus(summaries[d])
			}));
			return {
				...kid,
				grade: getCurrentGrade(kid.id),
				subjectCount: getLessonSubjectCount(kid.id),
				dueToday: countDueToday(kid.id, today),
				week,
				progress: getWeekProgress(kid.id, start, end)
			};
		});

	return { kids, days };
};
