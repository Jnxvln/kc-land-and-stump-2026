import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAdminStatus } from "#/functions/auth";
import { site } from "#/lib/site";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ location }) => {
		if (location.pathname === "/admin/login") return;
		const { isAdmin } = await getAdminStatus();
		if (!isAdmin) throw redirect({ to: "/admin/login" });
	},
	head: () => ({
		meta: [
			{ title: `Admin | ${site.name}` },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: () => (
		<section className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12">
			<Outlet />
		</section>
	),
});
