import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

/** Produces "scrypt:<salt>:<hash>", safe to store in an environment variable. */
export function hashPassword(password: string): string {
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, KEY_LENGTH);
	return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	const [scheme, saltHex, hashHex] = stored.split(":");
	if (scheme !== "scrypt" || !saltHex || !hashHex) {
		throw new Error(
			"ADMIN_PASSWORD_HASH is malformed. Regenerate it with pnpm auth:hash.",
		);
	}
	const expected = Buffer.from(hashHex, "hex");
	const actual = scryptSync(
		password,
		Buffer.from(saltHex, "hex"),
		expected.length,
	);
	return timingSafeEqual(actual, expected);
}
