import { services } from "./services";

export type Placement = { id: string; label: string; short: string };

export const PLACEMENTS: Placement[] = [
	{ id: "home-hero", label: "Home page: main photo", short: "Home" },
	...services.map((s) => ({
		id: `service-${s.slug}`,
		label: `${s.title}: card photo`,
		short: s.title,
	})),
];

export function isPlacement(id: string): boolean {
	return PLACEMENTS.some((p) => p.id === id);
}

export function placementShort(id: string): string {
	return PLACEMENTS.find((p) => p.id === id)?.short ?? id;
}
