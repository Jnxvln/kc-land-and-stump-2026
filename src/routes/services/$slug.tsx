import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CallTodayBand } from "#/components/CallTodayBand";
import { getService, services } from "#/lib/services";
import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";

export const Route = createFileRoute("/services/$slug")({
	loader: ({ params }) => {
		const service = getService(params.slug);
		if (!service) throw notFound();
		return { service };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [
					{ title: `${loaderData.service.title} | ${site.name}` },
					{ name: "description", content: loaderData.service.blurb },
				]
			: [],
	}),
	component: ServicePage,
});

function ServicePage() {
	const { service } = Route.useLoaderData();
	const otherServices = services.filter((s) => s.slug !== service.slug);

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
					<p className="m-0 max-w-[36em] text-xl">{service.blurb}</p>
				</div>
			</section>

			<section className={`${sectionX} pb-16 md:pb-22`}>
				<div className={`${container} flex flex-col gap-12 md:gap-16`}>
					{service.sections.map((section, i) => (
						<div
							key={section.body[0]}
							className={
								section.image
									? "grid items-center gap-6 md:grid-cols-2 md:gap-12"
									: "max-w-[44em]"
							}
						>
							<div
								className={`flex flex-col gap-4 ${i % 2 === 1 ? "md:order-2" : ""}`}
							>
								{section.body.map((paragraph) => (
									<p key={paragraph} className="m-0 text-lg md:text-xl">
										{paragraph}
									</p>
								))}
							</div>
							{section.image && (
								<img
									src={section.image.src}
									alt={section.image.alt}
									loading={i === 0 ? "eager" : "lazy"}
									className="block aspect-[4/3] w-full rounded-[10px] border border-line object-cover"
								/>
							)}
						</div>
					))}
				</div>
			</section>

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
