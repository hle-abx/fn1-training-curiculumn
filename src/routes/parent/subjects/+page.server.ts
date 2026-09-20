import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSubject } from '$lib/server/repositories/subjects';

export const actions: Actions = {
	createSubject: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const category = String(form.get('category') ?? 'academic');

		if (!name) return fail(400, { error: 'Name is required' });
		if (category !== 'academic' && category !== 'skill') return fail(400, { error: 'Invalid category' });

		try {
			createSubject(name, category);
		} catch {
			return fail(400, { error: 'A subject with that name already exists' });
		}
		return { success: true };
	}
};
