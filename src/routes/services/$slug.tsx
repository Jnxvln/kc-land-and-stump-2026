import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CallTodayBand } from "#/components/CallTodayBand";
import { PhotoGallery } from "#/components/PhotoGallery";
import { getFeaturedPhotos, getGalleryPhotos } from "#/functions/public-photos";
import { TEXT_ORIGINALS, toParagraphs } from "#/lib/editable-pages";
import { sectionSpotId } from "#/lib/placements";
import { seo } from "#/lib/seo";
import { getService, services } from "#/lib/services";
import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";
import { usePageText } from "#/lib/use-page-text";

export const Route = createFileRoute("/services/$slug")({
	loader: async ({ params }) => {
		const service = getService(params.slug);
		if (!service) throw notFound();
		const [photos, featured] = await Promise.all([
			getGalleryPhotos({ data: { serviceSlug: service.slug, limit: 8 } }),
			getFeaturedPhotos(),
		]);
		return { service, photos, featured };
	},
	head: ({ loaderData, matches }) => {
		if (!loaderData) return {};
		const published =
			(matches[0]?.loaderData as { text?: Record<string, string> } | undefined)
				?.text ?? {};
		const blurbKey = `service-${loaderData.service.slug}-blurb`;
		return seo({
			title: `${loaderData.service.title} | ${site.name}`,
			description: published[blurbKey] ?? TEXT_ORIGINALS[blurbKey],
			path: `/services/${loaderData.service.slug}`,
		});
	},
	component: ServicePage,
});

function ServicePage() {
	const { service, photos, featured } = Route.useLoaderData();
	const otherServices = services.filter((s) => s.slug !== service.slug);
	const text = usePageText();

	return (
		<>
			<section className={`${sectionX} pt-12 pb-10 md:pt-16`}>
				<div className={`${container} flex flex-col gap-4`}>
					<Link
						to="/services"
						className="inline-flex min-h-11 w-fit items-center text-[15px] font-bold text-muted no-underline hover:text-gold"
					>
						← All services
					</Link>
					<h1 className="m-0 font-display text-[40px] leading-[1.05] font-extrabold font-stretch-expanded text-cream md:text-[56px]">
						{service.title}
					</h1>
					<p className="m-0 max-w-[36em] text-xl">
						{text(`service-${service.slug}-blurb`)}
					</p>
				</div>
			</section>

			<section className={`${sectionX} pb-16 md:pb-22`}>
				<div className={`${container} flex flex-col gap-12 md:gap-16`}>
					{service.sections.map((section, i) => {
						const spotPhoto = featured[sectionSpotId(service.slug, i)];
						const image = spotPhoto
							? { src: spotPhoto.full, alt: spotPhoto.alt }
							: section.image;

						return (
							<div
								key={section.body[0]}
								className={
									image
										? "grid items-center gap-6 md:grid-cols-2 md:gap-12"
										: "max-w-[44em]"
								}
							>
								<div
									className={`flex flex-col gap-4 ${i % 2 === 1 ? "md:order-2" : ""}`}
								>
									{toParagraphs(text(sectionSpotId(service.slug, i))).map(
										(paragraph) => (
											<p key={paragraph} className="m-0 text-lg md:text-xl">
												{paragraph}
											</p>
										),
									)}
								</div>
								{image && (
									<img
										src={image.src}
										alt={image.alt}
										loading={i === 0 ? "eager" : "lazy"}
										className="block aspect-[4/3] w-full rounded-[10px] border border-line object-cover"
									/>
								)}
							</div>
						);
					})}
				</div>
			</section>

			{photos.length > 0 && (
				<section className={`${sectionX} pb-16 md:pb-22`}>
					<div className={`${container} flex flex-col gap-6`}>
						<h2 className="m-0 font-display text-[28px] font-extrabold font-stretch-expanded text-cream">
							Recent {service.title.toLowerCase()} jobs
						</h2>
						<PhotoGallery photos={photos} />
					</div>
				</section>
			)}

			<section className={`${sectionX} border-t border-line py-12`}>
				<div className={`${container} flex flex-col gap-4`}>
					<h2 className="m-0 font-display text-xl font-extrabold font-stretch-expanded text-cream">
						Other services
					</h2>
					<ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
						{otherServices.map((s) => (
							<li key={s.slug}>
								<Link
									to="/services/$slug"
									params={{ slug: s.slug }}
									className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-line-strong px-4 font-semibold text-gold no-underline hover:border-gold"
								>
									{s.title}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</section>

			<CallTodayBand />
		</>
	);
}
