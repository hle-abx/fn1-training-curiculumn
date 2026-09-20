import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { listProfiles } from '$lib/server/repositories/profiles';
import {
	createAssignment,
	deleteSubject,
	getCurrentSchoolYearId,
	getKidYearId,
	getSubject,
	listAssignmentsForSubject,
	updateSubject,
	type SubjectCategory
} from '$lib/server/repositories/subjects';

export const load: PageServerLoad = ({ params }) => {
	const subjectId = Number(params.subjectId);
	const subject = getSubject(subjectId);
	if (!subject) throw error(404, 'Subject not found');

	return {
		subject,
		assignments: listAssignmentsForSubject(subjectId),
		kids: listProfiles().filter((p) => p.role === 'kid')
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const subjectId = Number(params.subjectId);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const category = String(form.get('category') ?? 'academic');
		if (!name) return fail(400, { error: 'Name is required' });
		if (category !== 'academic' && category !== 'skill') return fail(400, { error: 'Invalid category' });
		updateSubject(subjectId, name, category as SubjectCategory);
		return { success: true };
	},

	delete: async ({ params }) => {
		const subjectId = Number(params.subjectId);
		try {
			deleteSubject(subjectId);
		} catch {
			return fail(400, { error: 'Cannot delete — this subject still has assignments. Remove those first.' });
		}
		throw redirect(303, '/parent/subjects');
	},

	assign: async ({ request, params }) => {
		const subjectId = Number(params.subjectId);
		const form = await request.formData();
		const kidProfileId = Number(form.get('kidProfileId'));
		const displayName = String(form.get('displayName') ?? '').trim();

		const schoolYearId = getCurrentSchoolYearId();
		if (!schoolYearId) return fail(400, { error: 'No current school year configured' });
		const kidYearId = getKidYearId(kidProfileId, schoolYearId);
		if (!kidYearId) return fail(400, { error: "That kid has no grade set for the current school year yet" });

		try {
			createAssignment(kidYearId, subjectId, displayName || undefined);
		} catch {
			return fail(400, { error: 'That subject is already assigned to this kid' });
		}
		return { success: true };
	}
};
