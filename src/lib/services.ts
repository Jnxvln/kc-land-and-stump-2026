export type ServiceImage = { src: string; alt: string };

export type Service = {
	slug: string;
	title: string;
	blurb: string;
	cardImage: ServiceImage;
	sections: { body: string[]; image?: ServiceImage }[];
};

export const services: Service[] = [
	{
		slug: "stump",
		title: "Stump Grinding",
		blurb:
			"Tree stumps ground down so you can get your yard, and your mower, back.",
		cardImage: {
			src: "/images/services/stump/stump-d81.webp",
			alt: "Stump grinding job",
		},
		// ASK DAD: any size limits on stumps? Does he haul off the grindings or leave them?
		sections: [
			{
				body: [
					"Stumps can be a real hassle to deal with and quickly destroy the look of your property.",
				],
				image: {
					src: "/images/services/stump/stump-fdi2.webp",
					alt: "Stump grinding job",
				},
			},
			{
				body: [
					"I grind stumps down with a tractor-mounted stump grinder, depending on your project size and location.",
					"Call today for a free estimate.",
				],
				image: {
					src: "/images/services/stump/stump-ckuh.webp",
					alt: "Stump grinding job",
				},
			},
		],
	},
	{
		slug: "land",
		title: "Land Clearing",
		blurb:
			"Brush, overgrowth, and small trees cleared, plus bush hogging for small to mid-size lots.",
		cardImage: {
			src: "/images/services/land/land-i381u.webp",
			alt: "Land clearing job",
		},
		sections: [
			{
				body: [
					"I clear small to medium-sized patches of land: brush, overgrowth, and small trees for residential and small-acreage jobs.",
				],
				image: {
					src: "/images/services/land/land-i381u.webp",
					alt: "Land clearing job",
				},
			},
			{
				body: [
					"I also bush hog small to medium-sized lots to knock down tall grass and brush. When the job's done, I can haul the brush off so you're not left with a pile to deal with.",
					"Call today for a free estimate.",
				],
				image: {
					src: "/images/services/land/land-ijucu2.webp",
					alt: "Land clearing job",
				},
			},
		],
	},
	{
		slug: "dirt",
		title: "Dirt Work",
		blurb:
			"Digging, spreading, and hauling dirt for small to mid-size projects.",
		cardImage: {
			src: "/images/services/dirtwork/dirtwork-fi1ds.webp",
			alt: "Dirt work job",
		},
		// ASK DAD: does he still do dirt work beyond delivering topsoil? If not, remove this
		// service and redirect /services/dirt to /services/hauling.
		sections: [
			{
				body: [
					"Digging, spreading, and transporting dirt often involves a lot of time and hard work. I can help you there.",
				],
				image: {
					src: "/images/services/dirtwork/dirtwork-fi1ds.webp",
					alt: "Dirt work job",
				},
			},
			{
				body: [
					"I can accommodate small to mid-size projects with my tractor, truck, and trailer.",
					"Call today for a free estimate.",
				],
				image: {
					src: "/images/services/dirtwork/dirtwork-cia03.webp",
					alt: "Dirt work job",
				},
			},
		],
	},
	{
		slug: "gravel",
		title: "Gravel Spreading",
		blurb: "Driveway gravel delivered and spread out with the tractor.",
		cardImage: {
			src: "/images/services/gravel/gravel-k3401.webp",
			alt: "Gravel spreading job",
		},
		// ASK DAD: typical driveway sizes / how many loads he usually spreads?
		sections: [
			{
				body: [
					"Gravel is important in a variety of projects, including driveways, parking areas, walkways, and landscaping.",
				],
				image: {
					src: "/images/services/gravel/gravel-k3401.webp",
					alt: "Gravel spreading job",
				},
			},
			{
				body: [
					"I deliver driveway gravel and spread it out with my tractor, that way you're not raking piles by hand.",
					"Call today for a free estimate.",
				],
				image: {
					src: "/images/services/gravel/gravel-x81s.webp",
					alt: "Gravel spreading job",
				},
			},
		],
	},
	{
		slug: "hauling",
		title: "Hauling & Delivery",
		blurb:
			"Bulk material deliveries, brush haul-off, and other delivery jobs with my dump trailer.",
		cardImage: {
			src: "/images/services/hauling/hauling-e81iz.webp",
			alt: "Truck and dump trailer",
		},
		// ASK DAD: how far will he deliver? Any load size or weight limits?
		sections: [
			{
				body: [
					"I deliver bulk landscape materials with my truck and dump trailer: gravel, topsoil, sand, compost, and mulch.",
				],
				image: {
					src: "/images/services/hauling/hauling-e81iz.webp",
					alt: "Truck and dump trailer",
				},
			},
			{
				body: [
					"When I clear a property, I can haul the brush away too, so the job is finished clean when I leave.",
				],
				image: {
					src: "/images/services/land/land-ijucu2.webp",
					alt: "Cleared land ready for brush haul-off",
				},
			},
			{
				body: [
					"I also take on other delivery jobs, like picking up something you bought elsewhere and bringing it to you, or moving something off your property. Give me a call and tell me what you need moved.",
					"Call today for a free estimate.",
				],
			},
		],
	},
];

export function getService(slug: string): Service | undefined {
	return services.find((service) => service.slug === slug);
}
