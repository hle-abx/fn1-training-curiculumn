import { getDb } from '../db';

export interface SchoolYear {
	id: number;
	label: string;
	start_date: string;
	end_date: string;
	is_current: number;
}

export function getCurrentSchoolYear(): SchoolYear | undefined {
	return getDb().prepare('SELECT * FROM school_years WHERE is_current = 1 LIMIT 1').get() as
		| SchoolYear
		| undefined;
}
