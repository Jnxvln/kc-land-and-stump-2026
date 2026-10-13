import { createFileRoute } from "@tanstack/react-router";
import { PhoneIcon } from "#/components/PhoneIcon";
import { site } from "#/lib/site";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const services = [
	{
		title: "Stump Grinding",
		blurb:
			"Tree stumps removed so you can get your yard, and your mower, back.",
		image: "/images/services/stump/stump-d81.webp",
		alt: "Stump grinding job",
	},
	{
		title: "Land Clearing",
		blurb:
			"Brush, overgrowth, and small trees cleared with bush hog, loader, and grapple.",
		image: "/images/services/land/land-i381u.webp",
		alt: "Land clearing job",
	},
	{
		title: "Dirt Work",
		blurb:
			"Digging, spreading, grading, and hauling dirt for small to mid-size projects.",
		image: "/images/services/dirtwork/dirtwork-fi1ds.webp",
		alt: "Dirt work job",
	},
	{
		title: "Gravel Spreading",
		blurb:
			"Gravel hauled, spread, graded, and packed for driveways, small roads, and walkways.",
		image: "/images/services/gravel/gravel-k3401.webp",
		alt: "Gravel spreading job",
	},
	{
		title: "Hauling & Delivery",
		blurb: "Dump-trailer hauling and deliveries of dirt, gravel, and more.",
		image: "/images/services/hauling/hauling-e81iz.webp",
		alt: "Truck and dump trailer",
	},
] as const;

// Temporary: replaced by the newest uploads once the photo system exists.
const recentWork = [
	{
		src: "/images/services/stump/stump-ckuh.webp",
		alt: "Stump grinding job",
	},
	{
		src: "/images/services/land/land-ijucu2.webp",
		alt: "Land clearing job",
	},
	{
		src: "/images/services/gravel/gravel-x81s.webp",
		alt: "Gravel spreading job",
	},
	{
		src: "/images/services/dirtwork/dirtwork-c9818.webp",
		alt: "Dirt work job",
	},
	{
		src: "/images/services/dirtwork/dirtwork-cia03.webp",
		alt: "Dirt work job",
	},
	{
		src: "/images/services/dirtwork/dirtwork-j381u.webp",
		alt: "Dirt work job",
	},
] as const;

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

const towns = [
	"Atlanta, TX",
	"Texarkana, TX",
	"Queen City, TX",
	"Redwater, TX",
];

const sectionX = "px-5 md:px-16";
const container = "mx-auto max-w-[1240px]";
const h2 =
	"m-0 font-display text-[32px] font-extrabold font-stretch-expanded md:text-[40px]";

function HomePage() {
	return (
		<>
			<Hero />
			<Services />
			<RecentWork />
			<WhyUs />
			<CallToday />
		</>
	);
}

function Hero() {
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
					<p className="m-0 max-w-[34em] text-xl">
						Stump grinding, dirt work, land clearing, bush hogging, gravel
						spreading, and dump-trailer hauling for homes and properties around{" "}
						{site.region}. Free estimates on every job.
					</p>
					<div className="mt-2 flex flex-wrap gap-3.5">
						<a
							href={site.phoneHref}
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
					<img
						src="/images/brand/banner.webp"
						alt="KC Land & Stump's Kubota tractor"
						width={960}
						height={359}
						className="block h-auto w-full"
						fetchPriority="high"
					/>
				</div>
			</div>
		</section>
	);
}

function Services() {
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
				<div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
					{services.map((service) => (
						<article
							key={service.title}
							className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-ground max-md:last:odd:col-span-2"
						>
							<img
								src={service.image}
								alt={service.alt}
								loading="lazy"
								className="block aspect-[4/3] w-full object-cover"
							/>
							<div className="flex flex-col gap-2 p-4.5 pb-5">
								<h3 className="m-0 font-display text-[19px] font-extrabold font-stretch-expanded text-cream">
									{service.title}
								</h3>
								<p className="m-0 text-base leading-snug">{service.blurb}</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function RecentWork() {
	return (
		<section id="work" className={`${sectionX} py-16 md:py-22`}>
			<div className={`${container} flex flex-col gap-9`}>
				<div className="flex flex-col gap-2.5">
					<h2 className={`${h2} text-cream`}>Fresh from the job site</h2>
					<p className="m-0 text-muted">The newest photos from recent jobs.</p>
				</div>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{recentWork.map((photo) => (
						<img
							key={photo.src}
							src={photo.src}
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
							{towns.map((town, i) => (
								<li
									// biome-ignore lint/suspicious/noArrayIndexKey: placeholder list, replaced with real towns
									key={i}
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

function CallToday() {
	return (
		<section
			id="contact"
			className={`${sectionX} bg-tractor py-20 text-ground md:py-24`}
		>
			<div
				className={`${container} flex flex-wrap items-center justify-between gap-8`}
			>
				<div className="flex flex-col gap-2">
					<p className="m-0 text-[15px] font-bold tracking-[0.14em] uppercase">
						Free estimates
					</p>
					<h2 className="m-0 font-display text-[40px] leading-[1.05] font-extrabold font-stretch-expanded md:text-5xl">
						Call today.
					</h2>
				</div>
				<div className="flex flex-col items-start gap-3">
					<a
						href={site.phoneHref}
						className="font-display text-4xl leading-[1.1] font-extrabold font-stretch-expanded text-ground no-underline md:text-[44px]"
					>
						{site.phone}
					</a>
					<a
						href={site.facebookUrl}
						target="_blank"
						rel="noopener"
						className="inline-flex min-h-11 items-center font-bold text-ground"
					>
						Or find me on Facebook →
					</a>
				</div>
			</div>
		</section>
	);
}
