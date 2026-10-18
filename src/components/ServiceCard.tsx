import { Link } from "@tanstack/react-router";
import type { GalleryPhoto } from "#/lib/gallery";
import { type Service, services } from "#/lib/services";
import { usePageText } from "#/lib/use-page-text";

type HeadingTag = "h2" | "h3";

export function ServiceCard({
	service,
	photo,
	headingAs: Heading = "h3",
}: {
	service: Service;
	photo?: GalleryPhoto;
	headingAs?: HeadingTag;
}) {
	const text = usePageText();

	return (
		<Link
			to="/services/$slug"
			params={{ slug: service.slug }}
			className="group flex flex-col overflow-hidden rounded-[10px] border border-line bg-ground text-gold no-underline transition-colors hover:border-line-strong min-[480px]:max-md:last:odd:col-span-2"
		>
			<img
				src={photo?.thumb ?? service.cardImage.src}
				alt={photo?.alt ?? service.cardImage.alt}
				loading="lazy"
				className="block aspect-[4/3] w-full object-cover"
			/>
			<div className="flex flex-1 flex-col gap-2 p-4.5 pb-5">
				<Heading className="m-0 font-display text-[19px] font-extrabold font-stretch-expanded text-cream">
					{service.title}
				</Heading>
				<p className="m-0 text-base leading-snug">
					{text(`service-${service.slug}-blurb`)}
				</p>
				<span className="mt-auto pt-1 text-[15px] font-bold text-tractor group-hover:underline">
					Learn more →
				</span>
			</div>
		</Link>
	);
}

export function ServiceGrid({
	headingAs,
	featured,
}: {
	headingAs?: HeadingTag;
	featured?: Record<string, GalleryPhoto>;
}) {
	return (
		<div className="grid grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
			{services.map((service) => (
				<ServiceCard
					key={service.slug}
					service={service}
					photo={featured?.[`service-${service.slug}`]}
					headingAs={headingAs}
				/>
			))}
		</div>
	);
}
