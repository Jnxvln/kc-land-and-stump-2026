import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { MAX_UPLOAD_MB, photoKey } from "#/lib/photos";
import { isPlacement } from "#/lib/placements";
import { getService } from "#/lib/services";
import { requireAdmin } from "#/server/auth";
import { type ProcessedPhoto, processPhoto } from "#/server/photo-processing";
import { deleteObjects, getObject, putObject } from "#/server/storage";

const keysFor = (id: string) => [photoKey(id, "large"), photoKey(id, "thumb")];

async function storeVariants(
	id: string,
	processed: ProcessedPhoto,
): Promise<void> {
	try {
		await putObject(photoKey(id, "large"), processed.large, "image/webp");
		await putObject(photoKey(id, "thumb"), processed.thumb, "image/webp");
	} catch (error) {
		await deleteObjects(keysFor(id)).catch(() => {});
		throw error;
	}
}

function requireId(data: { id?: unknown }): string {
	if (typeof data?.id !== "string" || data.id.length === 0)
		throw new Error("Missing photo id.");
	return data.id;
}

// --- List -------------------------------------------------------------------

export const listPhotos = createServerFn({ method: "GET" }).handler(
	async () => {
		requireAdmin();
		const photos = await prisma.photo.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				width: true,
				height: true,
				alt: true,
				visible: true,
				serviceSlug: true,
				createdAt: true,
				placements: { select: { spot: true } },
			},
		});
		return photos.map(({ placements, ...photo }) => ({
			...photo,
			spots: placements.map((p) => p.spot),
		}));
	},
);

export type AdminPhoto = Awaited<ReturnType<typeof listPhotos>>[number];

// --- Upload -----------------------------------------------------------------

export const uploadPhoto = createServerFn({ method: "POST" })
	.validator((data: FormData) => {
		if (!(data instanceof FormData)) throw new Error("Expected form data.");

		const file = data.get("file");
		if (!(file instanceof File) || file.size === 0)
			throw new Error("No photo was provided.");
		if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
			throw new Error(`Photos must be under ${MAX_UPLOAD_MB} MB.`);
		}

		const serviceSlug = String(data.get("serviceSlug") ?? "") || null;
		if (serviceSlug && !getService(serviceSlug))
			throw new Error("Unknown service.");

		return { file, serviceSlug };
	})
	.handler(async ({ data }) => {
		requireAdmin();
		const processed = await processPhoto(
			Buffer.from(await data.file.arrayBuffer()),
		);
		const id = crypto.randomUUID();

		// Files first, then the row, so the site never lists a photo whose files are missing.
		await storeVariants(id, processed);
		try {
			return await prisma.photo.create({
				data: {
					id,
					width: processed.width,
					height: processed.height,
					serviceSlug: data.serviceSlug,
				},
				select: { id: true },
			});
		} catch (error) {
			await deleteObjects(keysFor(id)).catch(() => {});
			throw error;
		}
	});

// --- Update -----------------------------------------------------------------

type PhotoUpdate = {
	id: string;
	alt?: string;
	visible?: boolean;
	serviceSlug?: string | null;
	spots?: string[];
};

export const updatePhoto = createServerFn({ method: "POST" })
	.validator((data: PhotoUpdate) => {
		const id = requireId(data);
		const update: Omit<PhotoUpdate, "id"> = {};

		if (data.alt !== undefined)
			update.alt = String(data.alt).trim().slice(0, 200);
		if (data.visible !== undefined) update.visible = Boolean(data.visible);
		if (data.serviceSlug !== undefined) {
			if (data.serviceSlug !== null && !getService(data.serviceSlug))
				throw new Error("Unknown service.");
			update.serviceSlug = data.serviceSlug;
		}
		if (data.spots !== undefined) {
			if (
				!Array.isArray(data.spots) ||
				!data.spots.every((s) => typeof s === "string" && isPlacement(s))
			) {
				throw new Error("Unknown placement.");
			}
			update.spots = [...new Set(data.spots)];
		}
		return { id, update };
	})
	.handler(async ({ data }) => {
		requireAdmin();
		const { spots, ...fields } = data.update;

		await prisma.$transaction(async (tx) => {
			await tx.photo.update({ where: { id: data.id }, data: fields });

			if (spots) {
				// Clear this photo's old spots, and free the chosen spots from any other
				// photo, then assign the chosen spots to this photo.
				await tx.photoPlacement.deleteMany({
					where: { OR: [{ photoId: data.id }, { spot: { in: spots } }] },
				});
				if (spots.length > 0) {
					await tx.photoPlacement.createMany({
						data: spots.map((spot) => ({ spot, photoId: data.id })),
					});
				}
			}
		});
		return { ok: true };
	});

// --- Delete -----------------------------------------------------------------

export const deletePhoto = createServerFn({ method: "POST" })
	.validator((data: { id: string }) => ({ id: requireId(data) }))
	.handler(async ({ data }) => {
		requireAdmin();
		// Row first, so the photo disappears from the site immediately. Leftover files
		// from a failed cleanup are harmless; a row pointing at missing files is not.
		await prisma.photo.delete({ where: { id: data.id } });
		await deleteObjects(keysFor(data.id)).catch((error) => {
			console.error("Failed to delete files for photo", data.id, error);
		});
		return { ok: true };
	});

// --- Rotate -----------------------------------------------------------------

export const rotatePhoto = createServerFn({ method: "POST" })
	.validator((data: { id: string; direction: "left" | "right" }) => {
		const id = requireId(data);
		if (data.direction !== "left" && data.direction !== "right")
			throw new Error("Invalid direction.");
		return { id, direction: data.direction };
	})
	.handler(async ({ data }) => {
		requireAdmin();
		const photo = await prisma.photo.findUniqueOrThrow({
			where: { id: data.id },
			include: { placements: { select: { spot: true } } },
		});

		const object = await getObject(photoKey(photo.id, "large"));
		const bytes = await object.Body?.transformToByteArray();
		if (!bytes) throw new Error("This photo's file is missing.");

		const processed = await processPhoto(
			Buffer.from(bytes),
			data.direction === "right" ? 90 : 270,
		);

		// Photo URLs are cached as unchanging, so a rotated photo gets a new id (and new
		// URLs) instead of overwriting files that browsers may have cached.
		const newId = crypto.randomUUID();
		await storeVariants(newId, processed);
		try {
			await prisma.$transaction([
				prisma.photo.delete({ where: { id: photo.id } }),
				prisma.photo.create({
					data: {
						id: newId,
						width: processed.width,
						height: processed.height,
						alt: photo.alt,
						caption: photo.caption,
						visible: photo.visible,
						placements: {
							create: photo.placements.map((p) => ({ spot: p.spot })),
						},
						serviceSlug: photo.serviceSlug,
						sortOrder: photo.sortOrder,
						createdAt: photo.createdAt,
					},
				}),
			]);
		} catch (error) {
			await deleteObjects(keysFor(newId)).catch(() => {});
			throw error;
		}

		await deleteObjects(keysFor(photo.id)).catch((error) => {
			console.error(
				"Failed to delete files for rotated photo",
				photo.id,
				error,
			);
		});
		return { id: newId };
	});
