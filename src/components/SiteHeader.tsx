import { Link } from "@tanstack/react-router";
import { site } from "#/lib/site";
import { PhoneIcon } from "./PhoneIcon";

const navItems = [
	{ label: "Services", to: "/services" },
	{ label: "Gallery", to: "/", hash: "work" },
	{ label: "Service Area", to: "/", hash: "area" },
	{ label: "Contact", to: "/", hash: "contact" },
] as const;

export function SiteHeader() {
	return (
		<header className="border-b border-line px-5 py-5 md:px-16">
			<div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6">
				<Link
					to="/"
					className="text-outline font-display text-[26px] leading-none font-extrabold font-stretch-expanded whitespace-nowrap no-underline"
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

				<a
					href={site.phoneHref}
					className="hidden min-h-11 shrink-0 items-center gap-2.5 rounded-md bg-tractor px-5 py-3 font-bold whitespace-nowrap text-ground no-underline md:inline-flex"
				>
					<PhoneIcon />
					{site.phone}
				</a>
			</div>
		</header>
	);
}
