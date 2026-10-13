import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

// Only these hosts may be indexed. Everything else (Railway URL, localhost) gets noindex.
const PRODUCTION_HOSTS = new Set([
	"kclandandstump.com",
	"www.kclandandstump.com",
]);

function getHostname(request: Request): string {
	// Behind Railway's proxy, prefer the forwarded host; fall back to Host, then the URL.
	const raw =
		request.headers.get("x-forwarded-host") ??
		request.headers.get("host") ??
		new URL(request.url).host;

	// Strip any port and take the first value if the header holds a list.
	return raw.split(",")[0].trim().split(":")[0].toLowerCase();
}

export const noindexStaging = createMiddleware().server(
	async ({ next, request }) => {
		if (!PRODUCTION_HOSTS.has(getHostname(request))) {
			setResponseHeader("X-Robots-Tag", "noindex, nofollow");
		}
		return next();
	},
);
