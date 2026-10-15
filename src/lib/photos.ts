export const PHOTO_VARIANTS = ["thumb", "large"] as const;
export type PhotoVariant = (typeof PHOTO_VARIANTS)[number];

export const MAX_UPLOAD_MB = 25;

/** Where a variant lives in the bucket. */
export function photoKey(id: string, variant: PhotoVariant): string {
	return `photos/${id}/${variant}.webp`;
}

/** The public URL that serves a variant through the site. */
export function photoUrl(id: string, variant: PhotoVariant): string {
	return `/photos/${id}/${variant}`;
}

export function isPhotoVariant(value: string): value is PhotoVariant {
	return (PHOTO_VARIANTS as readonly string[]).includes(value);
}
