import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "#/lib/gallery";

const navButton =
	"min-h-11 min-w-11 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-ground px-4 font-semibold text-gold hover:border-gold";

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [index, setIndex] = useState<number | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (index !== null && !dialog.open) dialog.showModal();
		if (index === null && dialog.open) dialog.close();
	}, [index]);

	const show = (i: number) => setIndex((i + photos.length) % photos.length);
	const current = index === null ? null : photos[index];

	return (
		<>
			<ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
				{photos.map((photo, i) => (
					<li key={photo.key}>
						<button
							type="button"
							onClick={() => show(i)}
							className="block w-full cursor-zoom-in overflow-hidden rounded-lg border-0 bg-card p-0"
						>
							<img
								src={photo.thumb}
								alt={photo.alt}
								loading="lazy"
								className="block aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
							/>
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={dialogRef}
				aria-label="Photo viewer"
				onClose={() => setIndex(null)}
				onClick={(e) => {
					if (e.target === e.currentTarget) setIndex(null);
				}}
				onKeyDown={(e) => {
					if (index === null) return;
					if (e.key === "ArrowRight") show(index + 1);
					if (e.key === "ArrowLeft") show(index - 1);
				}}
				className="m-auto max-h-[92dvh] max-w-[92vw] border-0 bg-transparent p-0 backdrop:bg-black/85"
			>
				{current && index !== null && (
					<figure className="m-0 flex flex-col items-center gap-3">
						<img
							src={current.full}
							alt={current.alt}
							className="block max-h-[78dvh] max-w-[92vw] rounded-lg object-contain"
						/>
						<figcaption className="text-[15px] text-muted">
							{index + 1} / {photos.length}
						</figcaption>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => show(index - 1)}
								className={navButton}
							>
								← Prev
							</button>
							<button
								type="button"
								onClick={() => setIndex(null)}
								className={navButton}
							>
								Close
							</button>
							<button
								type="button"
								onClick={() => show(index + 1)}
								className={navButton}
							>
								Next →
							</button>
						</div>
					</figure>
				)}
			</dialog>
		</>
	);
}
