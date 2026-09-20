import type { Cookies } from '@sveltejs/kit';
import { getProfile } from './repositories/profiles';
import { getSessionProfileId } from './session';

/** A kid can access their own pages; either parent can access any kid's
 * pages — see design/ui-ux.md §1.5, "parents are never more than one
 * tap from a kid's exact view." */
export function canAccessKidProfile(cookies: Cookies, targetProfileId: number): boolean {
	const sessionId = getSessionProfileId(cookies);
	const sessionProfile = sessionId ? getProfile(sessionId) : undefined;
	return !!sessionProfile && (sessionProfile.id === targetProfileId || sessionProfile.role === 'parent');
}

export function requireParentSession(cookies: Cookies) {
	const sessionId = getSessionProfileId(cookies);
	const sessionProfile = sessionId ? getProfile(sessionId) : undefined;
	return sessionProfile && sessionProfile.role === 'parent' ? sessionProfile : undefined;
}
