import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { type AdminPhoto, uploadPhoto } from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { getService } from "#/lib/services";

const chip =
	"min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-[15px] font-bold";
const chipOn = `${chip} border-cream bg-cream text-ground`;
const chipOff = `${chip} border-line-strong bg-transparent text-gold`;

export function PhotoPicker({
	open,
	title,
	photos,
	serviceSlug,
	currentId,
	onPick,
	onClose,
}: {
	open: boolean;
	title: string;
	photos: AdminPhoto[];
	serviceSlug?: string;
	currentId: string | null;
	onPick: (photoId: string) => void;
	onClose: () => void;
}) {
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [selected, setSelected] = useState<string | null>(currentId);
	const [filter, setFilter] = useState<"service" | "all">(
		serviceSlug ? "service" : "all",
	);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) {
			setSelected(currentId);
			setFilter(serviceSlug ? "service" : "all");
			setError(null);
			dialog.showModal();
		}
		if (!open && dialog.open) dialog.close();
	}, [open, currentId, serviceSlug]);

	const serviceTitle = serviceSlug ? getService(serviceSlug)?.title : undefined;
	const shown =
		filter === "service" && serviceSlug
			? photos.filter((p) => p.serviceSlug === serviceSlug)
			: photos;

	async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const input = e.currentTarget;
		const file = input.files?.[0];
		input.value = "";
		if (!file) return;

		setUploading(true);
		setError(null);
		const data = new FormData();
		data.set("file", file);
		if (serviceSlug) data.set("serviceSlug", serviceSlug);
		try {
			const { id } = await uploadPhoto({ data });
			await router.invalidate();
			setSelected(id);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setUploading(false);
		}
	}

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click mirrors the native Escape-to-close of <dialog>
		<dialog
			ref={dialogRef}
			aria-label="Choose a photo"
			onClose={onClose}
			onCancel={(e) => {
				if (uploading) e.preventDefault();
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget && !uploading) onClose();
			}}
			className="m-auto max-h-[92dvh] w-[min(94vw,900px)] overflow-y-auto rounded-xl border border-line bg-ground p-0 text-gold backdrop:bg-black/80"
		>
			{open && (
				<div className="flex flex-col gap-5 p-5 md:p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-0.5">
							<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
								Choose a photo
							</h2>
							<span className="text-muted">{title}</span>
						</div>
						<button
							type="button"
							onClick={onClose}
							disabled={uploading}
							className="min-h-11 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-transparent px-4 font-semibold text-gold"
						>
							Close
						</button>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap gap-2">
							{serviceSlug && (
								<button
									type="button"
									aria-pressed={filter === "service"}
									onClick={() => setFilter("service")}
									className={filter === "service" ? chipOn : chipOff}
								>
									{serviceTitle} photos
								</button>
							)}
							<button
								type="button"
								aria-pressed={filter === "all"}
								onClick={() => setFilter("all")}
								className={filter === "all" ? chipOn : chipOff}
							>
								All photos
							</button>
						</div>

						<label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border-[1.5px] border-dashed border-line-strong px-4 font-semibold text-gold hover:border-gold focus-within:border-tractor">
							{uploading ? "Uploading…" : "+ Upload a new photo"}
							<input
								type="file"
								accept="image/*,.heic,.heif"
								className="sr-only"
								disabled={uploading}
								onChange={handleUpload}
							/>
						</label>
					</div>

					{error && (
						<p role="alert" className="m-0 font-semibold text-tractor">
							{error}
						</p>
					)}

					{shown.length === 0 ? (
						<p className="m-0 text-muted">
							No photos here yet. Upload one, or switch to All photos.
						</p>
					) : (
						<ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4">
							{shown.map((photo) => {
								const isSelected = photo.id === selected;
								return (
									<li key={photo.id}>
										<button
											type="button"
											aria-pressed={isSelected}
											aria-label={photo.alt || "Untitled photo"}
											onClick={() => setSelected(photo.id)}
											className={`relative block w-full cursor-pointer overflow-hidden rounded-lg border-[3px] bg-card p-0 ${
												isSelected ? "border-tractor" : "border-transparent"
											}`}
										>
											<img
												src={photoUrl(photo.id, "thumb")}
												alt=""
												loading="lazy"
												className={`block aspect-square w-full object-cover ${photo.visible ? "" : "opacity-40"}`}
											/>
											{!photo.visible && (
												<span className="absolute bottom-1.5 left-1.5 rounded bg-ground px-1.5 py-0.5 text-xs font-bold text-gold">
													Hidden
												</span>
											)}
										</button>
									</li>
								);
							})}
						</ul>
					)}

					<div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={uploading}
							className="min-h-12 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-transparent px-5 font-semibold text-gold"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={() => selected && onPick(selected)}
							disabled={!selected || uploading}
							className="min-h-12 cursor-pointer rounded-md border-0 bg-tractor px-6 font-bold text-ground disabled:cursor-default disabled:opacity-50"
						>
							Use this photo
						</button>
					</div>
				</div>
			)}
		</dialog>
	);
}
