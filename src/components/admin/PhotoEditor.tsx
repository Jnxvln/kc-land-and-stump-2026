import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
	type AdminPhoto,
	deletePhoto,
	rotatePhoto,
	updatePhoto,
} from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { placementName } from "#/lib/placements";
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

	async function run(
		label: string,
		action: () => Promise<unknown>,
		{ close = true } = {},
	) {
		setBusy(label);
		setError(null);
		try {
			await action();
			await router.invalidate();
			if (close) onClose();
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
		};
		void run("save", () => updatePhoto({ data }));
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click mirrors the native Escape-to-close of <dialog>
		<dialog
			ref={dialogRef}
			aria-label="Edit photo"
			onClose={onClose}
			onCancel={(e) => {
				if (busy) e.preventDefault();
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget && !busy) onClose();
			}}
			className="m-auto max-h-[92dvh] w-[min(94vw,1000px)] overflow-y-auto rounded-[10px] border border-line bg-ground p-0 text-gold backdrop:bg-black/80"
		>
			{photo && (
				<form
					key={photo.id}
					onSubmit={handleSave}
					className="flex flex-col gap-4 p-4 md:p-5"
				>
					<div className="grid items-start gap-6 md:grid-cols-2 md:gap-7">
						<div className="flex flex-col gap-3">
							<img
								src={photoUrl(photo.id, "large")}
								alt={photo.alt}
								className="block aspect-[4/3] w-full rounded-lg bg-card object-contain"
							/>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									disabled={busy !== null}
									onClick={() =>
										run("rotate", () =>
											rotatePhoto({
												data: { id: photo.id, direction: "left" },
											}),
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
											rotatePhoto({
												data: { id: photo.id, direction: "right" },
											}),
										)
									}
									className={secondaryButton}
								>
									{busy === "rotate" ? "Rotating…" : "Rotate right ⟳"}
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-5">
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
								Description
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

							<div className="flex flex-col gap-2">
								<span className="font-semibold">Featured on</span>
								{photo.spots.length === 0 ? (
									<p className="m-0 text-[15px] text-muted">
										Not featured anywhere.
									</p>
								) : (
									<ul className="m-0 flex list-none flex-wrap gap-2 p-0">
										{photo.spots.map((spot) => (
											<li
												key={spot}
												className="inline-flex items-center gap-1 rounded-full bg-line pl-3 text-[15px] font-semibold text-cream"
											>
												{placementName(spot)}
												<button
													type="button"
													disabled={busy !== null}
													aria-label={`Remove from ${placementName(spot)}`}
													onClick={() =>
														run(
															"unfeature",
															() =>
																updatePhoto({
																	data: {
																		id: photo.id,
																		spots: photo.spots.filter(
																			(s) => s !== spot,
																		),
																	},
																}),
															{ close: false },
														)
													}
													className="flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-gold disabled:opacity-50"
												>
													<svg
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.4"
														strokeLinecap="round"
														aria-hidden="true"
													>
														<path d="M6 6l12 12M18 6L6 18" />
													</svg>
												</button>
											</li>
										))}
									</ul>
								)}
								<p className="m-0 text-[15px] text-muted">
									To feature this photo somewhere new, open that page under
									Pages and choose Change photo.
								</p>
							</div>

							{error && (
								<p role="alert" className="m-0 font-semibold text-tractor">
									{error}
								</p>
							)}

							<div className="flex gap-3 pt-1">
								<button
									type="submit"
									disabled={busy !== null}
									className="min-h-12 flex-1 cursor-pointer rounded-md bg-tractor text-lg font-bold text-ground disabled:opacity-50"
								>
									{busy === "save" ? "Saving…" : "Save changes"}
								</button>
								<button
									type="button"
									disabled={busy !== null}
									onClick={() => {
										if (
											window.confirm("Delete this photo? This can't be undone.")
										) {
											void run("delete", () =>
												deletePhoto({ data: { id: photo.id } }),
											);
										}
									}}
									className="min-h-12 cursor-pointer rounded-md border-[1.5px] border-tractor bg-transparent px-5 font-semibold text-tractor disabled:opacity-50"
								>
									{busy === "delete" ? "Deleting…" : "Delete photo"}
								</button>
							</div>
						</div>
					</div>
				</form>
			)}
		</dialog>
	);
}
