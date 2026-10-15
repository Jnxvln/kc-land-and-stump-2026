import { createServerFn } from "@tanstack/react-start";
import { attemptLogin, endSession, isAdminRequest } from "#/server/auth";

export const getAdminStatus = createServerFn({ method: "GET" }).handler(
	async () => {
		return { isAdmin: isAdminRequest() };
	},
);

export const login = createServerFn({ method: "POST" })
	.validator((data: { password: string }) => {
		if (typeof data?.password !== "string" || data.password.length === 0) {
			throw new Error("Enter your password.");
		}
		if (data.password.length > 200)
			throw new Error("That password isn't right.");
		return data;
	})
	.handler(async ({ data }) => {
		await attemptLogin(data.password);
		return { ok: true };
	});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
	endSession();
	return { ok: true };
});
