import { createFileRoute, Link } from "@tanstack/react-router";
import { getPagesOverview } from "#/functions/pages";
import { getFeaturedPhotos } from "#/functions/public-photos";
import { EDITABLE_PAGES } from "#/lib/editable-pages";

export const Route = createFileRoute("/admin/pages/")({
	loader: async () => {
		const [overview, featured] = await Promise.all([
			getPagesOverview(),
			getFeaturedPhotos(),
		]);
		return { drafts: overview.drafts, featured };
	},
	component: PagesList,
});

function PagesList() {
	const { drafts, featured } = Route.useLoaderData();

	return (
		<>
			<div className="flex flex-col gap-2">
				<h1 className="m-0 font-display text-3xl font-extrabold font-stretch-expanded text-cream">
					Pages
				</h1>
				<p className="m-0 max-w-[40em] text-muted">
					Pick a page to change its words and photos. Nothing changes on the
					website until you press Publish.
				</p>
			</div>

			<ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
				{EDITABLE_PAGES.map((page) => {
					const spot = page.blocks.find((b) => b.photo)?.photo;
					const thumb =
						(spot && featured[spot.spot]?.thumb) ?? spot?.original?.src;
					const sections = page.blocks.filter((b) => b.text).length;

					return (
						<li key={page.id}>
							<Link
								to="/admin/pages/$page"
								params={{ page: page.id }}
								className="flex h-full flex-col overflow-hidden rounded-[10px] border border-line bg-card text-gold no-underline hover:border-line-strong"
							>
								{thumb && (
									<img
										src={thumb}
										alt=""
										className="block aspect-video w-full object-cover"
									/>
								)}
								<div className="flex flex-1 flex-col gap-1 p-4 pb-5">
									<span className="font-display text-lg font-extrabold font-stretch-expanded text-cream">
										{page.title}
									</span>
									<span className="text-[15px] text-muted">
										{sections} {sections === 1 ? "section" : "sections"}
									</span>
									{drafts[page.id] && (
										<span className="mt-1 w-fit rounded bg-cream px-2 py-0.5 text-[13px] font-bold text-ground">
											Draft · not published
										</span>
									)}
									<span className="mt-auto pt-2 text-[15px] font-bold text-tractor">
										Edit page →
									</span>
								</div>
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
}
