import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "#/functions/auth";

export const Route = createFileRoute("/admin/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const password = String(
			new FormData(e.currentTarget).get("password") ?? "",
		);
		setBusy(true);
		setError(null);
		try {
			await login({ data: { password } });
			await navigate({ to: "/admin" });
		} catch (err) {
			setError((err as Error).message);
			setBusy(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
			<h1 className="m-0 font-display text-3xl font-extrabold font-stretch-expanded text-cream">
				Admin login
			</h1>
			{/* Hidden username helps password managers save and fill this login. */}
			<input
				type="text"
				name="username"
				autoComplete="username"
				value="admin"
				readOnly
				hidden
			/>
			<label className="flex flex-col gap-2 font-semibold">
				Password
				<input
					type="password"
					name="password"
					autoComplete="current-password"
					required
					className="min-h-12 rounded-md border border-line bg-card px-3 text-lg text-cream"
				/>
			</label>
			{error && (
				<p role="alert" className="m-0 font-semibold text-tractor">
					{error}
				</p>
			)}
			<button
				type="submit"
				disabled={busy}
				className="min-h-12 cursor-pointer rounded-md bg-tractor font-bold text-ground disabled:opacity-50"
			>
				{busy ? "Signing in…" : "Sign in"}
			</button>
		</form>
	);
}
