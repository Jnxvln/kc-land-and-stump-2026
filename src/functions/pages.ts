import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { toGalleryPhoto } from "#/functions/public-photos";
import {
	type EditablePage,
	getEditablePage,
	MAX_TEXT_LENGTH,
	TEXT_ORIGINALS,
} from "#/lib/editable-pages";
import type { GalleryPhoto } from "#/lib/gallery";
import { isAdminRequest, requireAdmin } from "#/server/auth";

/**
 * A page's draft (or live content, if there's no draft), shaped for the public page.
 * Returns null for anyone who isn't signed in, so a preview link is just the live page to them.
 */
export const getPagePreview = createServerFn({ method: "GET" })
	.validator((data: { page: string }) => ({ page: requirePage(data) }))
	.handler(async ({ data }) => {
		if (!isAdminRequest()) return null;
		const page = data.page;
		const draft = await prisma.pageDraft.findUnique({
			where: { page: page.id },
		});
		const content = draft
			? cleanContent(page, draft.content)
			: await liveContent(page);

		// Same rule as the live site: hidden or deleted photos fall back to the original.
		const ids = Object.values(content.photos).filter(
			(id): id is string => id !== null,
		);
		const visible = await prisma.photo.findMany({
			where: { id: { in: ids }, visible: true },
			select: { id: true, alt: true, serviceSlug: true },
		});
		const byId = new Map(visible.map((p) => [p.id, toGalleryPhoto(p)]));

		return {
			hasDraft: draft !== null,
			text: content.text,
			photos: Object.fromEntries(
				Object.entries(content.photos).map(([spot, id]) => [
					spot,
					id ? (byId.get(id) ?? null) : null,
				]),
			) as Record<string, GalleryPhoto | null>,
		};
	});

export type PagePreview = NonNullable<
	Awaited<ReturnType<typeof getPagePreview>>
>;

/** A page's complete state: every text field, and the photo id for every spot (null = use original). */
export type PageContent = {
	text: Record<string, string>;
	photos: Record<string, string | null>;
};

function keysOf(page: EditablePage) {
	return {
		textKeys: page.blocks.flatMap((b) => (b.text ? [b.text.key] : [])),
		spots: page.blocks.flatMap((b) => (b.photo ? [b.photo.spot] : [])),
	};
}

function requirePage(data: { page?: unknown }): EditablePage {
	const page =
		typeof data?.page === "string" ? getEditablePage(data.page) : undefined;
	if (!page) throw new Error("Unknown page.");
	return page;
}

/** Keeps only this page's fields, with sane types and lengths. Unknown keys are dropped. */
function cleanContent(page: EditablePage, raw: unknown): PageContent {
	const { textKeys, spots } = keysOf(page);
	const input = (raw ?? {}) as {
		text?: Record<string, unknown>;
		photos?: Record<string, unknown>;
	};
	const text: Record<string, string> = {};
	for (const key of textKeys) {
		const value = input.text?.[key];
		text[key] =
			typeof value === "string"
				? value.slice(0, MAX_TEXT_LENGTH)
				: TEXT_ORIGINALS[key];
	}
	const photos: Record<string, string | null> = {};
	for (const spot of spots) {
		const value = input.photos?.[spot];
		photos[spot] =
			typeof value === "string" && value.length <= 64 ? value : null;
	}
	return { text, photos };
}

async function liveContent(page: EditablePage): Promise<PageContent> {
	const { textKeys, spots } = keysOf(page);
	const [texts, placements] = await Promise.all([
		prisma.pageText.findMany({ where: { key: { in: textKeys } } }),
		prisma.photoPlacement.findMany({ where: { spot: { in: spots } } }),
	]);
	const textByKey = new Map(texts.map((t) => [t.key, t.text]));
	const photoBySpot = new Map(placements.map((p) => [p.spot, p.photoId]));
	return {
		text: Object.fromEntries(
			textKeys.map((k) => [k, textByKey.get(k) ?? TEXT_ORIGINALS[k]]),
		),
		photos: Object.fromEntries(
			spots.map((s) => [s, photoBySpot.get(s) ?? null]),
		),
	};
}

// --- Editor -----------------------------------------------------------------

export const getPageEditor = createServerFn({ method: "GET" })
	.validator((data: { page: string }) => data)
	.handler(async ({ data }) => {
		requireAdmin();
		const page = requirePage(data);
		const [live, draft] = await Promise.all([
			liveContent(page),
			prisma.pageDraft.findUnique({ where: { page: page.id } }),
		]);
		return {
			live,
			draft: draft
				? {
						content: cleanContent(page, draft.content),
						updatedAt: draft.updatedAt,
					}
				: null,
		};
	});

export const savePageDraft = createServerFn({ method: "POST" })
	.validator((data: { page: string; content: PageContent }) => ({
		page: requirePage(data),
		content: data?.content,
	}))
	.handler(async ({ data }) => {
		requireAdmin();
		const content = cleanContent(data.page, data.content);
		const draft = await prisma.pageDraft.upsert({
			where: { page: data.page.id },
			create: { page: data.page.id, content },
			update: { content },
		});
		return { updatedAt: draft.updatedAt };
	});

export const discardPageDraft = createServerFn({ method: "POST" })
	.validator((data: { page: string }) => ({ page: requirePage(data) }))
	.handler(async ({ data }) => {
		requireAdmin();
		await prisma.pageDraft.deleteMany({ where: { page: data.page.id } });
		return { ok: true };
	});

export const publishPageDraft = createServerFn({ method: "POST" })
	.validator((data: { page: string }) => ({ page: requirePage(data) }))
	.handler(async ({ data }) => {
		requireAdmin();
		const page = data.page;
		const draft = await prisma.pageDraft.findUnique({
			where: { page: page.id },
		});
		if (!draft) throw new Error("There are no changes to publish.");

		const content = cleanContent(page, draft.content);
		for (const block of page.blocks) {
			if (block.text && content.text[block.text.key].trim() === "") {
				throw new Error(`${block.label} can't be empty.`);
			}
		}

		// A photo deleted since it was chosen falls back to the original, rather than failing the publish.
		const chosenIds = Object.values(content.photos).filter(
			(id): id is string => id !== null,
		);
		const existing = new Set(
			(
				await prisma.photo.findMany({
					where: { id: { in: chosenIds } },
					select: { id: true },
				})
			).map((p) => p.id),
		);

		const { spots } = keysOf(page);
		await prisma.$transaction(async (tx) => {
			for (const [key, text] of Object.entries(content.text)) {
				const value = text.trim();
				if (value === TEXT_ORIGINALS[key].trim()) {
					await tx.pageText.deleteMany({ where: { key } });
				} else {
					await tx.pageText.upsert({
						where: { key },
						create: { key, text: value },
						update: { text: value },
					});
				}
			}

			await tx.photoPlacement.deleteMany({ where: { spot: { in: spots } } });
			const placements = Object.entries(content.photos)
				.filter(
					(entry): entry is [string, string] =>
						entry[1] !== null && existing.has(entry[1]),
				)
				.map(([spot, photoId]) => ({ spot, photoId }));
			if (placements.length > 0)
				await tx.photoPlacement.createMany({ data: placements });

			await tx.pageDraft.delete({ where: { page: page.id } });
		});

		return { ok: true };
	});

// --- Pages list -------------------------------------------------------------

export const getPagesOverview = createServerFn({ method: "GET" }).handler(
	async () => {
		requireAdmin();
		const drafts = await prisma.pageDraft.findMany({
			select: { page: true, updatedAt: true },
		});
		return {
			drafts: Object.fromEntries(
				drafts.map((d) => [d.page, d.updatedAt]),
			) as Record<string, Date>,
		};
	},
);
