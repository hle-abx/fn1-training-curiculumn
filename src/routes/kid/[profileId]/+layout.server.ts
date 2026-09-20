import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getProfile } from '$lib/server/repositories/profiles';
import { listKidSubjects } from '$lib/server/repositories/lessons';
import { canAccessKidProfile } from '$lib/server/authorize';

export const load: LayoutServerLoad = ({ params, cookies }) => {
	const profileId = Number(params.profileId);
	const profile = getProfile(profileId);
	if (!profile || profile.role !== 'kid') throw error(404, 'Not found');
	if (!canAccessKidProfile(cookies, profileId)) throw redirect(303, '/');

	return { profile, subjects: listKidSubjects(profileId) };
};
