import { createFileRoute } from "@tanstack/react-router";
import { PhoneIcon } from "#/components/PhoneIcon";
import { getSiteSettings } from "#/functions/settings";
import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";
import { useSiteSettings } from "#/lib/use-site-settings";

export const Route = createFileRoute("/contact")({
	loader: () => getSiteSettings(),
	head: ({ loaderData }) => ({
		meta: [
			{ title: `Contact | ${site.name}` },
			...(loaderData
				? [
						{
							name: "description",
							content: `Call ${loaderData.phone} for a free estimate. Serving ${loaderData.serviceArea.join(", ")}.`,
						},
					]
				: []),
		],
	}),
	component: ContactPage,
});

// ASK DAD: OK to list texting as an option? Any hours or days he prefers calls?
function ContactPage() {
	const { phone, phoneHref, serviceArea } = useSiteSettings();

	return (
		<section className={`${sectionX} pt-14 pb-20 md:pt-20 md:pb-24`}>
			<div className={`${container} flex flex-col gap-12`}>
				<div className="flex flex-col gap-3">
					<h1 className="m-0 font-display text-[40px] leading-[1.05] font-extrabold font-stretch-expanded text-cream md:text-[56px]">
						Contact
					</h1>
					<p className="m-0 max-w-[36em] text-xl">
						The fastest way to reach me is a phone call. Tell me about the job
						and I'll give you a free estimate.
					</p>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<a
						href={phoneHref}
						className="flex flex-col gap-3 rounded-[10px] bg-tractor p-7 text-ground no-underline md:p-9"
					>
						<span className="flex items-center gap-2.5 text-[15px] font-bold tracking-[0.14em] uppercase">
							<PhoneIcon size={18} />
							Call for a free estimate
						</span>
						<span className="font-display text-[34px] leading-[1.1] font-extrabold font-stretch-expanded md:text-[44px]">
							{phone}
						</span>
					</a>
					<a
						href={site.facebookUrl}
						target="_blank"
						rel="noopener"
						className="flex flex-col gap-3 rounded-[10px] border border-line bg-card p-7 text-gold no-underline hover:border-line-strong md:p-9"
					>
						<span className="text-[15px] font-bold tracking-[0.14em] text-muted uppercase">
							Facebook
						</span>
						<span className="font-display text-2xl font-extrabold font-stretch-expanded text-cream">
							See recent posts and photos →
						</span>
					</a>
				</div>

				<div
					id="area"
					className="flex scroll-mt-6 flex-col gap-4 border-t border-line pt-10"
				>
					<h2 className="m-0 font-display text-[28px] font-extrabold font-stretch-expanded text-cream">
						Service area
					</h2>
					<p className="m-0 max-w-[40em]">
						Based in the {site.region} region, serving these towns and the
						surrounding area:
					</p>
					<ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
						{serviceArea.map((town) => (
							<li
								key={town}
								className="rounded-full border-[1.5px] border-line-strong px-4 py-2 font-semibold text-gold"
							>
								{town}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
