import { Link, useNavigate } from "@tanstack/react-router";
import { logout } from "#/functions/auth";

const navLink =
	"inline-flex min-h-11 items-center rounded-md px-4 font-semibold text-gold no-underline hover:text-white";
const activeLink = "bg-cream font-bold text-ground hover:text-ground";

export function AdminHeader() {
	const navigate = useNavigate();

	return (
		<header className="border-b border-line px-5 py-3.5 md:px-8">
			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-7 gap-y-4">
				<div className="flex items-center gap-3">
					<span className="text-outline font-display text-[19px] font-extrabold font-stretch-expanded whitespace-nowrap">
						KC LAND &amp; STUMP
					</span>
					<span className="rounded bg-line px-2 py-0.5 text-[13px] font-bold tracking-[0.08em] text-cream uppercase">
						Admin
					</span>
				</div>

				<nav aria-label="Admin" className="flex flex-wrap gap-1">
					<Link
						to="/admin/photos"
						className={navLink}
						activeProps={{ className: activeLink }}
					>
						Photos
					</Link>
					<Link
						to="/admin/business"
						className={navLink}
						activeProps={{ className: activeLink }}
					>
						Business info
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<a
						href="/"
						target="_blank"
						rel="noopener"
						className="inline-flex min-h-11 items-center font-semibold text-gold no-underline"
					>
						View site ↗
					</a>
					<button
						type="button"
						onClick={async () => {
							await logout();
							await navigate({ to: "/admin/login" });
						}}
						className="min-h-11 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-transparent px-4 font-semibold text-gold"
					>
						Sign out
					</button>
				</div>
			</div>
		</header>
	);
}
