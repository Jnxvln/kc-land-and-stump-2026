import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function hasAdminHint(): boolean {
	return document.cookie.split("; ").includes("kc_admin_hint=1");
}

export function AdminShortcut() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [show, setShow] = useState(false);

	// Cookies only exist in the browser, so check after render, and again on each
	// navigation (so it appears right after signing in, without a page reload).
	useEffect(() => {
		setShow(!pathname.startsWith("/admin") && hasAdminHint());
	}, [pathname]);

	if (!show) return null;

	return (
		<Link
			to="/admin"
			className="fixed bottom-24 left-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-ground/95 px-4 font-bold text-gold no-underline shadow-lg hover:border-gold md:bottom-6"
		>
			✎ Manage site
		</Link>
	);
}
