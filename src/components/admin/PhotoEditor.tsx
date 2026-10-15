import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
	type AdminPhoto,
	deletePhoto,
	rotatePhoto,
	updatePhoto,
} from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { PLACEMENTS } from "#/lib/placements";
import { services } from "#/lib/services";

const field =
	"min-h-12 rounded-md border border-line bg-card px-3 text-base text-cream";
const secondaryButton =
	"min-h-12 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-transparent px-4 font-semibold text-gold hover:border-gold disabled:opacity-50";

export function PhotoEditor({
	photo,
	onClose,
}: {
	photo: AdminPhoto | null;
	onClose: () => void;
}) {
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (photo && !dialog.open) {
			setError(null);
			dialog.showModal();
		}
		if (!photo && dialog.open) dialog.close();
	}, [photo]);

	async function run(label: string, action: () => Promise<unknown>) {
		setBusy(label);
		setError(null);
		try {
			await action();
			await router.invalidate();
			onClose();
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setBusy(null);
		}
	}

	function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!photo) return;
		const form = new FormData(e.currentTarget);
		const data = {
			id: photo.id,
			alt: String(form.get("alt") ?? ""),
			visible: form.get("visible") === "on",
			serviceSlug: String(form.get("serviceSlug") ?? "") || null,
			placement: String(form.get("placement") ?? "") || null,
		};
		void run("save", () => updatePhoto({ data }));
	}

	return (
		<dialog
			ref={dialogRef}
			aria-label="Edit photo"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === e.currentTarget && !busy) onClose();
			}}
			className="m-auto max-h-[92dvh] w-[min(92vw,640px)] overflow-y-auto rounded-[10px] border border-line bg-ground p-0 text-gold backdrop:bg-black/80"
		>
			{photo && (
				<form
					key={photo.id}
					onSubmit={handleSave}
					className="flex flex-col gap-4 p-4 md:p-5"
				>
					<div className="flex items-center justify-between gap-3">
						<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
							Edit photo
						</h2>
						<button type="button" onClick={onClose} className={secondaryButton}>
							Close
						</button>
					</div>

					<img
						src={photoUrl(photo.id, "large")}
						alt={photo.alt}
						className="block max-h-[40dvh] w-full rounded-lg bg-card object-contain"
					/>

					<label className="flex min-h-12 cursor-pointer items-center gap-3 text-lg font-semibold">
						<input
							type="checkbox"
							name="visible"
							defaultChecked={photo.visible}
							className="size-6 accent-tractor"
						/>
						Show on the website
					</label>

					<label className="flex flex-col gap-2 font-semibold">
						Description (helps Google and screen readers)
						<input
							name="alt"
							defaultValue={photo.alt}
							maxLength={200}
							placeholder="e.g. Stump ground down in a front yard"
							className={field}
						/>
					</label>

					<label className="flex flex-col gap-2 font-semibold">
						Kind of job
						<select
							name="serviceSlug"
							defaultValue={photo.serviceSlug ?? ""}
							className={field}
						>
							<option value="">Not sure / mixed</option>
							{services.map((s) => (
								<option key={s.slug} value={s.slug}>
									{s.title}
								</option>
							))}
						</select>
					</label>

					<label className="flex flex-col gap-2 font-semibold">
						Feature this photo
						<select
							name="placement"
							defaultValue={photo.placement ?? ""}
							className={field}
						>
							<option value="">Not featured</option>
							{PLACEMENTS.map((p) => (
								<option key={p.id} value={p.id}>
									{p.label}
								</option>
							))}
						</select>
					</label>

					{error && (
						<p role="alert" className="m-0 font-semibold text-tractor">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={busy !== null}
						className="min-h-12 cursor-pointer rounded-md bg-tractor text-lg font-bold text-ground disabled:opacity-50"
					>
						{busy === "save" ? "Saving…" : "Save changes"}
					</button>

					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							disabled={busy !== null}
							onClick={() =>
								run("rotate", () =>
									rotatePhoto({ data: { id: photo.id, direction: "left" } }),
								)
							}
							className={secondaryButton}
						>
							{busy === "rotate" ? "Rotating…" : "⟲ Rotate left"}
						</button>
						<button
							type="button"
							disabled={busy !== null}
							onClick={() =>
								run("rotate", () =>
									rotatePhoto({ data: { id: photo.id, direction: "right" } }),
								)
							}
							className={secondaryButton}
						>
							{busy === "rotate" ? "Rotating…" : "Rotate right ⟳"}
						</button>
					</div>

					<button
						type="button"
						disabled={busy !== null}
						onClick={() => {
							if (window.confirm("Delete this photo? This can't be undone.")) {
								void run("delete", () =>
									deletePhoto({ data: { id: photo.id } }),
								);
							}
						}}
						className="min-h-12 cursor-pointer rounded-md border-[1.5px] border-tractor bg-transparent font-semibold text-tractor disabled:opacity-50"
					>
						{busy === "delete" ? "Deleting…" : "Delete photo"}
					</button>
				</form>
			)}
		</dialog>
	);
}
