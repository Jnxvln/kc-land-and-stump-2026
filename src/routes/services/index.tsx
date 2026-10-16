import { createFileRoute } from "@tanstack/react-router";
import { CallTodayBand } from "#/components/CallTodayBand";
import { ServiceGrid } from "#/components/ServiceCard";
import { getFeaturedPhotos } from "#/functions/public-photos";
import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";

export const Route = createFileRoute("/services/")({
	loader: () => getFeaturedPhotos(),
	head: () => ({
		meta: [
			{ title: `Services | ${site.name}` },
			{
				name: "description",
				content: `Stump grinding, land clearing, dirt work, gravel spreading, and hauling around ${site.region}.`,
			},
		],
	}),
	component: ServicesPage,
});

function ServicesPage() {
	const featured = Route.useLoaderData();
	return (
		<>
			<section className={`${sectionX} pt-14 pb-16 md:pt-20 md:pb-22`}>
				<div className={`${container} flex flex-col gap-10`}>
					<div className="flex flex-col gap-3">
						<h1 className="m-0 font-display text-[40px] leading-[1.05] font-extrabold font-stretch-expanded text-cream md:text-[56px]">
							Services
						</h1>
						<p className="m-0 max-w-[40em] text-xl">
							Small to mid-size jobs with my tractor, truck, and dump trailer,
							around {site.region} and nearby.
						</p>
					</div>
					<ServiceGrid headingAs="h2" featured={featured} />
				</div>
			</section>
			<CallTodayBand />
		</>
	);
}
