import { sectionSpotId } from "./placements";
import { type ServiceImage, services } from "./services";
import { site } from "./site";

export type PageBlock = {
	label: string;
	help?: string;
	text?: { key: string; original: string; rows: number };
	photo?: { spot: string; original: ServiceImage | null };
};

export type EditablePage = {
	id: string;
	title: string;
	path: string;
	blocks: PageBlock[];
};

export const MAX_TEXT_LENGTH = 2000;

export const EDITABLE_PAGES: EditablePage[] = [
	{
		id: "home",
		title: "Home page",
		path: "/",
		blocks: [
			{
				label: "Top of the page",
				help: "The paragraph under the headline, and the main photo beside it.",
				text: {
					key: "home-intro",
					original: `Stump grinding, dirt work, land clearing, bush hogging, gravel spreading, and dump-trailer hauling for homes and properties around ${site.region}. Free estimates on every job.`,
					rows: 4,
				},
				photo: {
					spot: "home-hero",
					original: {
						src: "/images/brand/banner.webp",
						alt: "KC Land & Stump's Kubota tractor",
					},
				},
			},
		],
	},
	...services.map((s) => ({
		id: s.slug,
		title: s.title,
		path: `/services/${s.slug}`,
		blocks: [
			{
				label: "Service card",
				help: "Shown on the service cards, at the top of this page, and in Google results.",
				text: { key: `service-${s.slug}-blurb`, original: s.blurb, rows: 2 },
				photo: { spot: `service-${s.slug}`, original: s.cardImage },
			},
			...s.sections.map((section, i) => ({
				label: `Section ${i + 1}`,
				text: {
					key: sectionSpotId(s.slug, i),
					original: section.body.join("\n\n"),
					rows: 6,
				},
				photo: {
					spot: sectionSpotId(s.slug, i),
					original: section.image ?? null,
				},
			})),
		],
	})),
];

export function getEditablePage(id: string): EditablePage | undefined {
	return EDITABLE_PAGES.find((p) => p.id === id);
}

/** Original wording for every editable text field, by key. */
export const TEXT_ORIGINALS: Record<string, string> = Object.fromEntries(
	EDITABLE_PAGES.flatMap((p) =>
		p.blocks.flatMap((b) => (b.text ? [[b.text.key, b.text.original]] : [])),
	),
);

/** Splits edited text into paragraphs: a blank line starts a new one. */
export function toParagraphs(text: string): string[] {
	return text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
}
