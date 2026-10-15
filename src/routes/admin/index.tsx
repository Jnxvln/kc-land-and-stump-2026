import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { logout } from "#/functions/auth";
import { uploadPhoto } from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { services } from "#/lib/services";

export const Route = createFileRoute("/admin/")({
	component: AdminPage,
});

type Result = { name: string; id?: string; error?: string };

function AdminPage() {
	const navigate = useNavigate();
	const [results, setResults] = useState<Result[]>([]);
	const [busy, setBusy] = useState(false);
	const [selected, setSelected] = useState<File[]>([]);

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const formEl = e.currentTarget;
		const form = new FormData(formEl);
		const files = form
			.getAll("files")
			.filter((f): f is File => f instanceof File && f.size > 0);

		setBusy(true);
		for (const file of files) {
			const data = new FormData();
			data.set("file", file);
			data.set("alt", String(form.get("alt") ?? ""));
			data.set("serviceSlug", String(form.get("serviceSlug") ?? ""));
			try {
				const photo = await uploadPhoto({ data });
				setResults((r) => [...r, { name: file.name, id: photo.id }]);
			} catch (error) {
				setResults((r) => [
					...r,
					{ name: file.name, error: (error as Error).message },
				]);
			}
		}
		setBusy(false);
		formEl.reset();
		setSelected([]);
	}

	return (
		<section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12">
			<button
				type="button"
				onClick={async () => {
					await logout();
					await navigate({ to: "/admin/login" });
				}}
				className="w-fit cursor-pointer rounded-md border border-line-strong bg-transparent px-4 py-2 font-semibold text-gold"
			>
				Sign out
			</button>
			<h1 className="m-0 font-display text-3xl font-extrabold text-cream">
				Photos
			</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-line-strong bg-card p-6 text-center hover:border-gold focus-within:border-tractor">
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
						className="text-tractor"
					>
						<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
						<circle cx="12" cy="14" r="3.5" />
					</svg>
					<span className="font-display text-xl font-extrabold font-stretch-expanded text-cream">
						{selected.length > 0
							? `${selected.length} photo${selected.length === 1 ? "" : "s"} selected`
							: "Choose photos"}
					</span>
					<span className="text-[15px] text-muted">
						{selected.length > 0
							? "Tap to change"
							: "Tap to pick from your phone's photos"}
					</span>
					<input
						type="file"
						name="files"
						accept="image/*"
						multiple
						className="sr-only"
						onChange={(e) =>
							setSelected(Array.from(e.currentTarget.files ?? []))
						}
					/>
				</label>
				<input
					name="alt"
					placeholder="Alt text (optional)"
					className="rounded border border-line bg-card p-2"
				/>
				<select
					name="serviceSlug"
					className="rounded border border-line bg-card p-2"
				>
					<option value="">No service</option>
					{services.map((s) => (
						<option key={s.slug} value={s.slug}>
							{s.title}
						</option>
					))}
				</select>
				<button
					type="submit"
					disabled={busy || selected.length === 0}
					className="rounded bg-tractor p-3 font-bold text-ground disabled:opacity-50"
				>
					{busy ? "Uploading…" : "Upload"}
				</button>
			</form>
			<ul className="m-0 flex list-none flex-col gap-4 p-0">
				{results.map((r) => (
					<li
						key={`${r.name}-${r.id ?? r.error}`}
						className="flex items-center gap-4"
					>
						{r.id ? (
							<img
								src={photoUrl(r.id, "thumb")}
								alt=""
								className="size-24 rounded object-cover"
							/>
						) : null}
						<span>
							{r.name}:{" "}
							{r.id ?? <span className="text-tractor">{r.error}</span>}
						</span>
					</li>
				))}
			</ul>
		</section>
	);
}
