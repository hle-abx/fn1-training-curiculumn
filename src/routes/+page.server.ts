import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getProfile, listProfiles } from '$lib/server/repositories/profiles';
import { countDueToday } from '$lib/server/repositories/lessons';
import { verifyPin } from '$lib/server/auth';
import { setSessionCookie } from '$lib/server/session';
import { todayIso } from '$lib/utils/date';

export const load: PageServerLoad = () => {
	const today = todayIso();
	const profiles = listProfiles().map((p) => ({
		...p,
		dueToday: p.role === 'kid' ? countDueToday(p.id, today) : null
	}));
	return { profiles };
};

export const actions: Actions = {
	unlock: async ({ request, cookies }) => {
		const form = await request.formData();
		const profileId = Number(form.get('profileId'));
		const pin = String(form.get('pin') ?? '');

		const profile = getProfile(profileId);
		if (!profile || !verifyPin(pin, profile.pin_hash)) {
			return fail(401, { error: 'Wrong PIN', profileId });
		}

		setSessionCookie(cookies, profile.id);
		throw redirect(303, profile.role === 'parent' ? '/parent' : `/kid/${profile.id}`);
	}
};
