import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { uploadPhoto } from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { services } from "#/lib/services";

export const Route = createFileRoute("/dev/upload")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) throw notFound();
	},
	component: DevUploadPage,
});

type Result = { name: string; id?: string; error?: string };

function DevUploadPage() {
	const [results, setResults] = useState<Result[]>([]);
	const [busy, setBusy] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
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
	}

	return (
		<section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12">
			<h1 className="m-0 font-display text-3xl font-extrabold text-cream">
				Dev upload test
			</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<input type="file" name="files" accept="image/*" multiple required />
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
					disabled={busy}
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
