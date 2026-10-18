import { createFileRoute, Link } from "@tanstack/react-router";
import { CallTodayBand } from "#/components/CallTodayBand";
import { PhoneIcon } from "#/components/PhoneIcon";
import { ServiceGrid } from "#/components/ServiceCard";
import { getFeaturedPhotos, getGalleryPhotos } from "#/functions/public-photos";
import { toParagraphs } from "#/lib/editable-pages";
import { type GalleryPhoto, staticGalleryPhotos } from "#/lib/gallery";
import { seo } from "#/lib/seo";
import { site } from "#/lib/site";
import { container, h2, sectionX } from "#/lib/ui";
import { usePageText } from "#/lib/use-page-text";
import { useSiteSettings } from "#/lib/use-site-settings";

export const Route = createFileRoute("/")({
	loader: async () => {
		const [featured, recent] = await Promise.all([
			getFeaturedPhotos(),
			getGalleryPhotos({ data: { limit: 6 } }),
		]);
		return {
			featured,
			recent: recent.length > 0 ? recent : staticGalleryPhotos.slice(0, 6),
		};
	},
	head: () =>
		seo({
			title: `${site.name} | Stump Grinding & Land Clearing in ${site.region}`,
			description: `Stump grinding, land clearing, bush hogging, gravel spreading, and hauling around ${site.region}. Free estimates.`,
			path: "/",
		}),
	component: HomePage,
});

const reasons = [
	{
		title: "Free estimates",
		body: "Tell me about the job and I'll give you a straight estimate before any work starts.",
	},
	{
		title: "The right equipment",
		body: "A Kubota tractor with bush hog, box blade, front-end loader, grapple, and stump grinder, plus a truck and dump trailer.",
	},
] as const;

function HomePage() {
	const { featured, recent } = Route.useLoaderData();
	return (
		<>
			<Hero photo={featured["home-hero"]} />
			<Services featured={featured} />
			<RecentWork photos={recent} />
			<WhyUs />
			<CallTodayBand />
		</>
	);
}

function Hero({ photo }: { photo?: GalleryPhoto }) {
	const { phoneHref } = useSiteSettings();
	const text = usePageText();

	return (
		<section id="top" className={`${sectionX} pt-14 pb-16 md:pt-22 md:pb-24`}>
			<div
				className={`${container} grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-14`}
			>
				<div className="flex flex-col gap-6">
					<p className="m-0 text-[15px] font-bold tracking-[0.14em] text-tractor uppercase">
						Tractor services · {site.region} region
					</p>
					<h1 className="m-0 font-display text-[40px] leading-[1.04] font-extrabold font-stretch-expanded text-cream md:text-[60px]">
						Stumps ground. Land cleared. Gravel spread.
					</h1>
					{toParagraphs(text("home-intro")).map((paragraph) => (
						<p key={paragraph} className="m-0 max-w-[34em] text-xl">
							{paragraph}
						</p>
					))}
					<div className="mt-2 flex flex-wrap gap-3.5">
						<a
							href={phoneHref}
							className="inline-flex min-h-11 items-center gap-2.5 rounded-md bg-tractor px-6.5 py-4 text-[19px] font-bold text-ground no-underline"
						>
							<PhoneIcon size={20} />
							Call for a free estimate
						</a>
						<a
							href="#work"
							className="inline-flex min-h-11 items-center rounded-md border-[1.5px] border-line-strong px-6.5 py-4 text-[19px] font-semibold text-cream no-underline"
						>
							See recent work
						</a>
					</div>
				</div>
				<div className="overflow-hidden rounded-[10px] border border-line bg-card">
					{photo ? (
						<img
							src={photo.full}
							alt={photo.alt}
							fetchPriority="high"
							className="block aspect-[4/3] w-full object-cover"
						/>
					) : (
						<img
							src="/images/brand/banner.webp"
							alt="KC Land & Stump's Kubota tractor"
							width={960}
							height={359}
							fetchPriority="high"
							className="block h-auto w-full"
						/>
					)}
				</div>
			</div>
		</section>
	);
}

function Services({ featured }: { featured: Record<string, GalleryPhoto> }) {
	return (
		<section
			id="services"
			className={`${sectionX} border-y border-line bg-surface py-16 md:py-22`}
		>
			<div className={`${container} flex flex-col gap-10`}>
				<div className="flex flex-col gap-2.5">
					<h2 className={`${h2} text-cream`}>What I do</h2>
					<p className="m-0 max-w-[40em] text-muted">
						Small to mid-size jobs with my tractor, truck, and dump trailer.
					</p>
				</div>
				<ServiceGrid featured={featured} />
			</div>
		</section>
	);
}

function RecentWork({ photos }: { photos: GalleryPhoto[] }) {
	return (
		<section id="work" className={`${sectionX} py-16 md:py-22`}>
			<div className={`${container} flex flex-col gap-9`}>
				<div className="flex flex-wrap items-end justify-between gap-5">
					<div className="flex flex-col gap-2.5">
						<h2 className={`${h2} text-cream`}>Fresh from the job site</h2>
						<p className="m-0 text-muted">
							The newest photos from recent jobs.
						</p>
					</div>
					<Link
						to="/gallery"
						className="inline-flex min-h-11 items-center font-bold text-tractor no-underline hover:underline"
					>
						View the full gallery →
					</Link>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{photos.map((photo) => (
						<img
							key={photo.key}
							src={photo.thumb}
							alt={photo.alt}
							loading="lazy"
							className="block aspect-square w-full rounded-lg object-cover"
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function WhyUs() {
	const { serviceArea } = useSiteSettings();
	return (
		<section
			id="area"
			className={`${sectionX} bg-gold py-16 text-ground md:py-22`}
		>
			<div className={`${container} flex flex-col gap-11`}>
				<h2 className={h2}>Why call {site.name}</h2>
				<div className="grid gap-7 md:grid-cols-3 md:gap-10">
					{reasons.map((reason) => (
						<div
							key={reason.title}
							className="flex flex-col gap-2.5 border-t-[3px] border-ground pt-4.5"
						>
							<h3 className="m-0 font-display text-[21px] font-extrabold font-stretch-expanded">
								{reason.title}
							</h3>
							<p className="m-0 text-ink">{reason.body}</p>
						</div>
					))}
					<div className="flex flex-col gap-2.5 border-t-[3px] border-ground pt-4.5">
						<h3 className="m-0 font-display text-[21px] font-extrabold font-stretch-expanded">
							Local to the area
						</h3>
						<p className="m-0 text-ink">Based in the {site.region} region.</p>
						<ul className="m-0 mt-1 flex list-none flex-wrap gap-2 p-0">
							{serviceArea.map((town, i) => (
								<li
									key={town}
									className={
										i === 0
											? "rounded-full bg-ground px-3 py-1.5 text-[15px] font-semibold text-gold"
											: "rounded-full border-[1.5px] border-ink px-3 py-1.5 text-[15px] font-semibold"
									}
								>
									{town}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
