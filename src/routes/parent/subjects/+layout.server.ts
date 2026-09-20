import type { LayoutServerLoad } from './$types';
import { listAssignments, listSubjectsCatalog } from '$lib/server/repositories/subjects';

export const load: LayoutServerLoad = () => {
	const subjects = listSubjectsCatalog();
	const assignments = listAssignments();
	const tree = subjects.map((s) => ({
		...s,
		assignments: assignments.filter((a) => a.subject_id === s.id)
	}));
	return { tree };
};
