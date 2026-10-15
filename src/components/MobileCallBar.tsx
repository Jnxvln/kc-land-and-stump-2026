import { useRouterState } from "@tanstack/react-router";
import { site } from "#/lib/site";
import { PhoneIcon } from "./PhoneIcon";

export function MobileCallBar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	if (pathname.startsWith("/admin")) return null;

	return (
		<div className="sticky bottom-0 z-10 border-t border-line bg-ground px-4 py-3 md:hidden">
			<a
				href={site.phoneHref}
				className="flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-tractor p-3.5 text-lg font-bold text-ground no-underline"
			>
				<PhoneIcon size={20} />
				Call for a free estimate
			</a>
		</div>
	);
}
