import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { MAX_UPLOAD_MB, photoKey } from "#/lib/photos";
import { getService } from "#/lib/services";
import { requireAdmin } from "#/server/auth";
import { processPhoto } from "#/server/photo-processing";
import { deleteObjects, putObject } from "#/server/storage";

export const uploadPhoto = createServerFn({ method: "POST" })
	.validator((data: unknown) => {
		if (!(data instanceof FormData)) throw new Error("Expected form data.");

		const file = data.get("file");
		if (!(file instanceof File) || file.size === 0)
			throw new Error("No photo was provided.");
		if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
			throw new Error(`Photos must be under ${MAX_UPLOAD_MB} MB.`);
		}

		const alt = String(data.get("alt") ?? "")
			.trim()
			.slice(0, 200);
		const serviceSlug = String(data.get("serviceSlug") ?? "") || null;
		if (serviceSlug && !getService(serviceSlug))
			throw new Error("Unknown service.");

		return { file, alt, serviceSlug };
	})
	.handler(async ({ data }) => {
		requireAdmin();

		const processed = await processPhoto(
			Buffer.from(await data.file.arrayBuffer()),
		);

		const id = crypto.randomUUID();
		const keys = [photoKey(id, "large"), photoKey(id, "thumb")];

		// Files first, then the database row, so the site never lists a photo
		// whose files don't exist. If anything fails, clean up what was stored.
		try {
			await putObject(keys[0], processed.large, "image/webp");
			await putObject(keys[1], processed.thumb, "image/webp");

			return await prisma.photo.create({
				data: {
					id,
					width: processed.width,
					height: processed.height,
					alt: data.alt,
					serviceSlug: data.serviceSlug,
				},
				select: { id: true, width: true, height: true },
			});
		} catch (error) {
			await deleteObjects(keys).catch(() => {});
			throw error;
		}
	});
