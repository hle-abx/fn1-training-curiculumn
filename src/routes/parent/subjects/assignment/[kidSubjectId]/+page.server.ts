import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { deleteAssignment, getAssignment } from '$lib/server/repositories/subjects';
import {
	createLesson,
	createUnit,
	deleteLesson,
	deleteUnit,
	getUnitsWithLessons,
	updateLesson,
	updateUnit,
	type LessonFields,
	type LessonStatus
} from '$lib/server/repositories/lessons';

export const load: PageServerLoad = ({ params }) => {
	const kidSubjectId = Number(params.kidSubjectId);
	const assignment = getAssignment(kidSubjectId);
	if (!assignment) throw error(404, 'Assignment not found');

	return { assignment, units: getUnitsWithLessons(kidSubjectId) };
};

function lessonFieldsFromForm(form: FormData): LessonFields {
	const title = String(form.get('title') ?? '').trim();
	return {
		title,
		description: String(form.get('description') ?? ''),
		resourceUrl: String(form.get('resourceUrl') ?? ''),
		dueDate: String(form.get('dueDate') ?? '') || undefined,
		notes: String(form.get('notes') ?? ''),
		status: (String(form.get('status') ?? 'not_started') as LessonStatus) || undefined,
		scoreValue: String(form.get('scoreValue') ?? ''),
		scoreType: String(form.get('scoreType') ?? '') || undefined
	};
}

export const actions: Actions = {
	deleteAssignment: async ({ params }) => {
		deleteAssignment(Number(params.kidSubjectId));
		throw redirect(303, '/parent/subjects');
	},

	createUnit: async ({ request, params }) => {
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		if (!title) return fail(400, { error: 'Title is required' });
		createUnit(Number(params.kidSubjectId), title, String(form.get('description') ?? ''));
		return { success: true };
	},

	updateUnit: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('unitId'));
		const title = String(form.get('title') ?? '').trim();
		if (!title) return fail(400, { error: 'Title is required' });
		updateUnit(id, title, String(form.get('description') ?? ''));
		return { success: true };
	},

	deleteUnit: async ({ request }) => {
		const form = await request.formData();
		deleteUnit(Number(form.get('unitId')));
		return { success: true };
	},

	createLesson: async ({ request }) => {
		const form = await request.formData();
		const unitId = Number(form.get('unitId'));
		const fields = lessonFieldsFromForm(form);
		if (!fields.title) return fail(400, { error: 'Title is required' });
		createLesson(unitId, fields);
		return { success: true };
	},

	updateLesson: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('lessonId'));
		const fields = lessonFieldsFromForm(form);
		if (!fields.title) return fail(400, { error: 'Title is required' });
		updateLesson(id, fields);
		return { success: true };
	},

	deleteLesson: async ({ request }) => {
		const form = await request.formData();
		deleteLesson(Number(form.get('lessonId')));
		return { success: true };
	}
};
