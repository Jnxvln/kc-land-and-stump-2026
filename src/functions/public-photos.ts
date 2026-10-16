import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import type { GalleryPhoto } from "#/lib/gallery";
import { photoUrl } from "#/lib/photos";
import { getService } from "#/lib/services";
import { site } from "#/lib/site";

const publicFields = { id: true, alt: true, serviceSlug: true } as const;

function toGalleryPhoto(photo: {
	id: string;
	alt: string;
	serviceSlug: string | null;
}): GalleryPhoto {
	const service = photo.serviceSlug ? getService(photo.serviceSlug) : undefined;
	return {
		key: photo.id,
		thumb: photoUrl(photo.id, "thumb"),
		full: photoUrl(photo.id, "large"),
		alt:
			photo.alt ||
			(service
				? `${service.title} job by ${site.name}`
				: `Recent job by ${site.name}`),
	};
}

/** Newest visible photos, optionally only those tagged with one service. */
export const getGalleryPhotos = createServerFn({ method: "GET" })
	.validator((data: { limit?: number; serviceSlug?: string } | undefined) => ({
		limit: Math.min(Math.max(Math.trunc(data?.limit ?? 200), 1), 200),
		serviceSlug:
			typeof data?.serviceSlug === "string" ? data.serviceSlug : undefined,
	}))
	.handler(async ({ data }) => {
		const photos = await prisma.photo.findMany({
			where: {
				visible: true,
				...(data.serviceSlug ? { serviceSlug: data.serviceSlug } : {}),
			},
			orderBy: { createdAt: "desc" },
			take: data.limit,
			select: publicFields,
		});
		return photos.map(toGalleryPhoto);
	});

/** Visible photos featured in a spot, keyed by spot id (e.g. "home-hero"). */
export const getFeaturedPhotos = createServerFn({ method: "GET" }).handler(
	async () => {
		const rows = await prisma.photoPlacement.findMany({
			where: { photo: { visible: true } },
			select: { spot: true, photo: { select: publicFields } },
		});
		return Object.fromEntries(
			rows.map((row) => [row.spot, toGalleryPhoto(row.photo)]),
		) as Record<string, GalleryPhoto>;
	},
);
