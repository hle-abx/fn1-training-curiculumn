import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { requireParentSession } from '$lib/server/authorize';

export const load: LayoutServerLoad = ({ cookies }) => {
	const parent = requireParentSession(cookies);
	if (!parent) throw redirect(303, '/');
	return { parent };
};
