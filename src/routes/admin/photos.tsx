import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhotoEditor } from "#/components/admin/PhotoEditor";
import { PhotoUploader } from "#/components/admin/PhotoUploader";
import { listPhotos } from "#/functions/photos";
import { photoUrl } from "#/lib/photos";
import { placementShort } from "#/lib/placements";

export const Route = createFileRoute("/admin/photos")({
	loader: () => listPhotos(),
	component: PhotosPage,
});

const badge = "rounded px-1.5 py-0.5 text-xs font-bold";

function PhotosPage() {
	const photos = Route.useLoaderData();
	const [editingId, setEditingId] = useState<string | null>(null);
	const editing = photos.find((p) => p.id === editingId) ?? null;

	return (
		<div className="flex flex-col gap-8">
			<h1 className="m-0 font-display text-3xl font-extrabold font-stretch-expanded text-cream">
				Photos
			</h1>

			<PhotoUploader />

			<section className="flex flex-col gap-4">
				<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
					Your photos ({photos.length})
				</h2>
				{photos.length === 0 ? (
					<p className="m-0 text-muted">No photos yet. Add some above.</p>
				) : (
					<>
						<p className="m-0 text-[15px] text-muted">
							Tap a photo to edit, hide, rotate, or feature it.
						</p>
						<ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
							{photos.map((photo) => (
								<li key={photo.id}>
									<button
										type="button"
										onClick={() => setEditingId(photo.id)}
										className="relative block w-full cursor-pointer overflow-hidden rounded-lg border-0 bg-card p-0"
									>
										<img
											src={photoUrl(photo.id, "thumb")}
											alt={photo.alt || "Untitled photo"}
											loading="lazy"
											className={`block aspect-square w-full object-cover ${photo.visible ? "" : "opacity-40"}`}
										/>
										<span className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 p-1.5">
											{!photo.visible && (
												<span className={`${badge} bg-ground text-gold`}>
													Hidden
												</span>
											)}
											{photo.spots.map((spot) => (
												<span
													key={spot}
													className={`${badge} bg-tractor text-ground`}
												>
													★ {placementShort(spot)}
												</span>
											))}
										</span>
									</button>
								</li>
							))}
						</ul>
					</>
				)}
			</section>

			<PhotoEditor photo={editing} onClose={() => setEditingId(null)} />
		</div>
	);
}
