import { createHmac, timingSafeEqual } from "node:crypto";
import {
	deleteCookie,
	getCookie,
	getRequestHeader,
	setCookie,
} from "@tanstack/react-start/server";
import { verifyPassword } from "./password";

const COOKIE = "kc_admin";
const HINT_COOKIE = "kc_admin_hint";
const SESSION_DAYS = 30;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is required`);
	return value;
}

function sign(value: string): string {
	return createHmac("sha256", requireEnv("SESSION_SECRET"))
		.update(value)
		.digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// --- Sessions -------------------------------------------------------------

export function startSession(): void {
	const maxAge = SESSION_DAYS * 24 * 60 * 60;
	const payload = String(Date.now() + maxAge * 1000);
	setCookie(COOKIE, `${payload}.${sign(payload)}`, {
		httpOnly: true,
		secure: process.env.NODE_ENV !== "development",
		sameSite: "lax",
		path: "/",
		maxAge,
	});
	// Not a credential: only tells the public pages to show the admin shortcut.
	// The httpOnly session cookie is still what actually grants access.
	setCookie(HINT_COOKIE, "1", {
		httpOnly: false,
		secure: process.env.NODE_ENV !== "development",
		sameSite: "lax",
		path: "/",
		maxAge,
	});
}

export function endSession(): void {
	deleteCookie(COOKIE, { path: "/" });
	deleteCookie(HINT_COOKIE, { path: "/" });
}

export function isAdminRequest(): boolean {
	const token = getCookie(COOKIE);
	if (!token) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature || !safeEqual(signature, sign(payload)))
		return false;
	return Number(payload) > Date.now();
}

/** Call at the top of every admin-only server function. */
export function requireAdmin(): void {
	if (!isAdminRequest()) throw new Error("Not authorized.");
}

// --- Login with rate limiting -----------------------------------------------

const failures = new Map<string, { count: number; since: number }>();

function clientIp(): string {
	// Railway's proxy sets X-Real-IP. The last X-Forwarded-For entry is the one its
	// proxy appended; earlier entries can be supplied by the client and faked.
	const realIp = getRequestHeader("x-real-ip");
	if (realIp) return realIp;
	const forwarded = getRequestHeader("x-forwarded-for")
		?.split(",")
		.at(-1)
		?.trim();
	return forwarded || "unknown";
}

export async function attemptLogin(password: string): Promise<void> {
	const ip = clientIp();
	const now = Date.now();
	const record = failures.get(ip);
	if (record && now - record.since > LOCKOUT_MS) failures.delete(ip);

	const current = failures.get(ip);
	if (current && current.count >= MAX_FAILURES) {
		throw new Error("Too many attempts. Try again in 15 minutes.");
	}

	if (!verifyPassword(password, requireEnv("ADMIN_PASSWORD_HASH"))) {
		failures.set(ip, {
			count: (current?.count ?? 0) + 1,
			since: current?.since ?? now,
		});
		await new Promise((resolve) => setTimeout(resolve, 1000));
		throw new Error("That password isn't right.");
	}

	failures.delete(ip);
	startSession();
}
