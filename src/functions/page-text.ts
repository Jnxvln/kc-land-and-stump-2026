import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";

/** All published wording overrides, by key. A small table: one row per edited field. */
export const getPublishedText = createServerFn({ method: "GET" }).handler(
	async () => {
		const rows = await prisma.pageText.findMany({
			select: { key: true, text: true },
		});
		return Object.fromEntries(rows.map((r) => [r.key, r.text])) as Record<
			string,
			string
		>;
	},
);
