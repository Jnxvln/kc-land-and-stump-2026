import { services } from "./services";

export type Placement = {
	id: string;
	label: string;
	short: string;
	group: string;
};

/** The spot for one content section's photo on a service page, e.g. "service-hauling-section-2". */
export function sectionSpotId(slug: string, index: number): string {
	return `service-${slug}-section-${index + 1}`;
}

export const PLACEMENTS: Placement[] = [
	{ id: "home-hero", label: "Main photo", short: "Home", group: "Home page" },
	...services.map((s) => ({
		id: `service-${s.slug}`,
		label: `${s.title} card`,
		short: `${s.title} card`,
		group: "Service cards",
	})),
	...services.flatMap((s) =>
		s.sections.map((_, i) => ({
			id: sectionSpotId(s.slug, i),
			label: `Photo ${i + 1}`,
			short: `${s.title} ${i + 1}`,
			group: `${s.title} page`,
		})),
	),
];

export function isPlacement(id: string): boolean {
	return PLACEMENTS.some((p) => p.id === id);
}

export function placementShort(id: string): string {
	return PLACEMENTS.find((p) => p.id === id)?.short ?? id;
}

/** Placements grouped for display, in order. */
export const PLACEMENT_GROUPS: { group: string; placements: Placement[] }[] =
	PLACEMENTS.reduce<{ group: string; placements: Placement[] }[]>(
		(groups, placement) => {
			const last = groups.at(-1);
			if (last?.group === placement.group) last.placements.push(placement);
			else groups.push({ group: placement.group, placements: [placement] });
			return groups;
		},
		[],
	);
