import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 32;

/** Hashes a 4-digit PIN as `salt:hash`, both hex. Never store PINs in plaintext. */
export function hashPin(pin: string): string {
	const salt = randomBytes(16);
	const hash = scryptSync(pin, salt, KEY_LENGTH);
	return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPin(pin: string, stored: string): boolean {
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return false;
	const salt = Buffer.from(saltHex, 'hex');
	const expected = Buffer.from(hashHex, 'hex');
	const actual = scryptSync(pin, salt, KEY_LENGTH);
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
