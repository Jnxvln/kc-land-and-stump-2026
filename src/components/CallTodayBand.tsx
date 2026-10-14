import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";

export function CallTodayBand() {
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
