import { site } from "#/lib/site";

export function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="px-5 pt-10 pb-12 md:px-16">
			<div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 text-[15px] text-muted">
				<span className="text-outline font-display text-lg font-extrabold font-stretch-expanded">
					KC LAND &amp; STUMP
				</span>
				<span>
					© {site.foundedYear}–{year} {site.name} · All rights reserved
				</span>
			</div>
		</footer>
	);
}
