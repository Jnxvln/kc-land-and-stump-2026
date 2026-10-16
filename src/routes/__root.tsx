import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AdminShortcut } from "#/components/AdminShortcut";
import { MobileCallBar } from "#/components/MobileCallBar";
import { ScrollToTop } from "#/components/ScrollToTop";
import { SiteFooter } from "#/components/SiteFooter";
import { SiteHeader } from "#/components/SiteHeader";
import { getSiteSettings } from "#/functions/settings";
import { localBusinessJsonLd } from "#/lib/seo";
import { site } from "#/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	loader: () => getSiteSettings(),
	// Settings rarely change, so don't refetch on every client-side navigation.
	// Saving in the admin calls router.invalidate(), which refreshes immediately.
	staleTime: 5 * 60 * 1000,
	head: ({ loaderData }) => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: site.name },
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Source+Sans+3:wght@400;600;700&display=swap",
			},
			{ rel: "stylesheet", href: appCss },
		],
		scripts: loaderData
			? [
					{
						type: "application/ld+json",
						children: localBusinessJsonLd(loaderData),
					},
				]
			: [],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex min-h-dvh flex-col">
				<SiteHeader />
				<main className="flex-1">{children}</main>
				<SiteFooter />
				<MobileCallBar />
				<AdminShortcut />
				<ScrollToTop />
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function NotFound() {
	return (
		<section className="px-5 py-24 md:px-16">
			<div className="mx-auto flex max-w-[1240px] flex-col items-start gap-5">
				<h1 className="m-0 font-display text-[40px] font-extrabold font-stretch-expanded text-cream">
					Page not found
				</h1>
				<p className="m-0 text-xl">
					That page doesn't exist, but the phone number still works.
				</p>
				<Link to="/" className="font-bold text-tractor">
					← Back to the home page
				</Link>
			</div>
		</section>
	);
}
