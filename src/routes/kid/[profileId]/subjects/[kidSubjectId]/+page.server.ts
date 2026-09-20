import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { canAccessKidProfile } from '$lib/server/authorize';
import { getAssignment } from '$lib/server/repositories/subjects';
import { cycleLessonStatus, getUnitsWithLessons } from '$lib/server/repositories/lessons';

export const load: PageServerLoad = ({ params }) => {
	const kidSubjectId = Number(params.kidSubjectId);
	const assignment = getAssignment(kidSubjectId);
	if (!assignment) throw error(404, 'Subject not found');
	// Defense in depth: this kidSubjectId must actually belong to the kid
	// in the URL, not just to *a* kid the session happens to be allowed to see.
	if (assignment.kid_profile_id !== Number(params.profileId)) throw error(404, 'Subject not found');

	return { assignment, units: getUnitsWithLessons(kidSubjectId) };
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
