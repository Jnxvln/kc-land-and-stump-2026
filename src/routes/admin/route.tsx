import {
	createFileRoute,
	Outlet,
	redirect,
	useRouterState,
} from "@tanstack/react-router";
import { AdminHeader } from "#/components/admin/AdminHeader";
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
	component: AdminLayout,
});

function AdminLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isLogin = pathname === "/admin/login";

	return (
		<>
			{!isLogin && <AdminHeader />}
			<div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:px-8">
				<Outlet />
			</div>
		</>
	);
}
