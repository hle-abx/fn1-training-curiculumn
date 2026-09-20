import type { Cookies } from '@sveltejs/kit';

const COOKIE_NAME = 'trellis_session';

/** Local home app, single trusted network — a plain profile id cookie is
 * enough; the PIN gate happens at unlock time, not per-request. */
export function setSessionCookie(cookies: Cookies, profileId: number): void {
	cookies.set(COOKIE_NAME, String(profileId), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30
	});
}

export function getSessionProfileId(cookies: Cookies): number | null {
	const raw = cookies.get(COOKIE_NAME);
	if (!raw) return null;
	const id = Number(raw);
	return Number.isInteger(id) ? id : null;
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(COOKIE_NAME, { path: '/' });
}
