import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/db";
import { normalizePhone, phoneHref, phoneProblem } from "#/lib/phone";
import { site } from "#/lib/site";
import { requireAdmin } from "#/server/auth";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
	async () => {
		const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
		const phone = row?.phone ?? site.defaultPhone;
		return {
			phone,
			phoneHref: phoneHref(phone),
			serviceArea: row?.serviceArea ?? [...site.defaultServiceArea],
		};
	},
);

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

export const updateSiteSettings = createServerFn({ method: "POST" })
	.validator((data: { phone: string; serviceArea: string[] }) => {
		const problem = phoneProblem(String(data?.phone ?? ""));
		if (problem) throw new Error(problem);
		const phone = normalizePhone(String(data.phone)) as string;
		if (!phone)
			throw new Error("Enter a 10-digit phone number, like 903-555-1234.");

		if (!Array.isArray(data.serviceArea))
			throw new Error("Invalid service area.");
		const towns = [
			...new Set(
				data.serviceArea
					.map((t) => String(t).trim().slice(0, 60))
					.filter(Boolean),
			),
		];
		if (towns.length === 0) throw new Error("Add at least one town.");
		if (towns.length > 20)
			throw new Error("Keep the list to 20 towns or fewer.");

		return { phone, serviceArea: towns };
	})
	.handler(async ({ data }) => {
		requireAdmin();
		await prisma.siteSettings.upsert({
			where: { id: 1 },
			create: { id: 1, ...data },
			update: data,
		});
		return { ok: true };
	});
