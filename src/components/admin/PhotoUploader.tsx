import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { uploadPhoto } from "#/functions/photos";
import { services } from "#/lib/services";

type Item = {
	key: string;
	name: string;
	status: "waiting" | "uploading" | "done" | "error";
	error?: string;
};

const statusText = {
	waiting: "Waiting…",
	uploading: "Uploading…",
	done: "✓ Added",
} as const;

export function PhotoUploader() {
	const router = useRouter();
	const [selected, setSelected] = useState<File[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [busy, setBusy] = useState(false);

	const patchItem = (key: string, patch: Partial<Item>) =>
		setItems((current) =>
			current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
		);

	async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		const formEl = e.currentTarget;
		const serviceSlug = String(new FormData(formEl).get("serviceSlug") ?? "");
		const queue = selected.map((file) => ({ file, key: crypto.randomUUID() }));

		setItems(
			queue.map(({ file, key }) => ({
				key,
				name: file.name,
				status: "waiting",
			})),
		);
		setBusy(true);

		for (const { file, key } of queue) {
			patchItem(key, { status: "uploading" });
			const data = new FormData();
			data.set("file", file);
			data.set("serviceSlug", serviceSlug);
			try {
				await uploadPhoto({ data });
				patchItem(key, { status: "done" });
			} catch (error) {
				patchItem(key, { status: "error", error: (error as Error).message });
			}
		}

		setBusy(false);
		formEl.reset();
		setSelected([]);
		await router.invalidate();
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-4 md:p-5"
		>
			<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
				Add photos
			</h2>

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
					accept="image/*,.heic,.heif"
					multiple
					className="sr-only"
					onChange={(e) => setSelected(Array.from(e.currentTarget.files ?? []))}
				/>
			</label>

			<label className="flex flex-col gap-2 font-semibold">
				What kind of job? (optional)
				<select
					name="serviceSlug"
					className="min-h-12 rounded-md border border-line bg-card px-3 text-base text-cream"
				>
					<option value="">Not sure / mixed</option>
					{services.map((s) => (
						<option key={s.slug} value={s.slug}>
							{s.title}
						</option>
					))}
				</select>
			</label>

			<button
				type="submit"
				disabled={busy || selected.length === 0}
				className="min-h-12 cursor-pointer rounded-md bg-tractor text-lg font-bold text-ground disabled:cursor-default disabled:opacity-50"
			>
				{busy ? "Uploading…" : "Upload"}
			</button>

			{items.length > 0 && (
				<ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px]">
					{items.map((item) => (
						<li key={item.key} className="flex justify-between gap-3">
							<span className="truncate">{item.name}</span>
							<span
								className={
									item.status === "error"
										? "font-semibold text-tractor"
										: "shrink-0 text-muted"
								}
							>
								{item.status === "error" ? item.error : statusText[item.status]}
							</span>
						</li>
					))}
				</ul>
			)}
		</form>
	);
}
