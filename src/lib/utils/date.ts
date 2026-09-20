/**
 * Shared date helpers — pure functions, safe to import from client or
 * server code.
 *
 * All dates here are plain "YYYY-MM-DD" calendar dates with no time
 * component. To avoid off-by-one drift, every function anchors its
 * arithmetic to UTC consistently (parsing AND serializing in UTC) —
 * mixing local-time parsing with `toISOString()`'s UTC output is what
 * causes the classic "date is one day off" bug.
 */

function parseIsoUtc(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d));
}

export function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
	const d = parseIsoUtc(iso);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

/** Monday-start week range (inclusive) containing the given ISO date. */
export function weekRangeIso(iso: string): { start: string; end: string } {
	const dow = parseIsoUtc(iso).getUTCDay(); // 0 = Sunday
	const mondayOffset = dow === 0 ? -6 : 1 - dow;
	const start = addDaysIso(iso, mondayOffset);
	const end = addDaysIso(start, 6);
	return { start, end };
}

export function isoRange(startIso: string, endIso: string): string[] {
	const out: string[] = [];
	let cur = startIso;
	while (cur <= endIso) {
		out.push(cur);
		cur = addDaysIso(cur, 1);
	}
	return out;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekdayLabel(iso: string): string {
	return WEEKDAY_LABELS[parseIsoUtc(iso).getUTCDay()];
}

export function dayOfMonth(iso: string): number {
	return parseIsoUtc(iso).getUTCDate();
}

export function formatFriendlyDate(iso: string): string {
	return parseIsoUtc(iso).toLocaleDateString(undefined, {
		timeZone: 'UTC',
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});
}
