import { Link, useRouterState } from "@tanstack/react-router";
import { navItems } from "#/lib/nav";
import { useSiteSettings } from "#/lib/use-site-settings";
import { MobileMenu } from "./MobileMenu";
import { PhoneIcon } from "./PhoneIcon";

export function SiteHeader() {
	const { phone, phoneHref } = useSiteSettings();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<header className="relative border-b border-line px-5 py-5 md:px-16">
			<div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 sm:gap-6">
				<Link
					to="/"
					onClick={(e) => {
						if (pathname === "/") {
							e.preventDefault();
							window.scrollTo({ top: 0 });
						}
					}}
					className="text-outline font-display text-[clamp(1.125rem,5.6vw,1.625rem)] leading-none font-extrabold font-stretch-expanded whitespace-nowrap no-underline"
				>
					KC LAND &amp; STUMP
				</Link>

				<nav
					aria-label="Main"
					className="hidden gap-6 text-[17px] font-semibold whitespace-nowrap lg:flex xl:gap-8"
				>
					{navItems.map((item) => (
						<Link
							key={item.label}
							to={item.to}
							hash={"hash" in item ? item.hash : undefined}
							className="text-gold no-underline hover:text-white"
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<a
						href={phoneHref}
						className="hidden min-h-11 shrink-0 items-center gap-2.5 rounded-md bg-tractor px-5 py-3 font-bold whitespace-nowrap text-ground no-underline md:inline-flex"
					>
						<PhoneIcon />
						{phone}
					</a>

					<MobileMenu />
				</div>
			</div>
		</header>
	);
}
