import type { GalleryPhoto } from "./gallery";

/** Reads the ?preview flag from the URL. Each preview uses a unique value, so it never reuses a cached copy. */
export function previewSearch(search: Record<string, unknown>): {
	preview?: string;
} {
	const value = search.preview;
	if (typeof value === "string" || typeof value === "number")
		return { preview: String(value) };
	if (value === true) return { preview: "1" };
	return {};
}

/** Lays a preview's photo choices over the live featured photos. null = show the original. */
export function applyPreviewPhotos(
	featured: Record<string, GalleryPhoto>,
	preview: { photos: Record<string, GalleryPhoto | null> } | null,
): Record<string, GalleryPhoto> {
	if (!preview) return featured;
	const merged: Record<string, GalleryPhoto | null> = {
		...featured,
		...preview.photos,
	};
	return Object.fromEntries(
		Object.entries(merged).filter(
			(entry): entry is [string, GalleryPhoto] => entry[1] !== null,
		),
	);
}
