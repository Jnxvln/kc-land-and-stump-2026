import { defineHandler } from "nitro/h3";
import { services } from "../lib/services";
import { site } from "../lib/site";

const paths = [
	"/",
	"/services",
	...services.map((s) => `/services/${s.slug}`),
	"/gallery",
	"/contact",
];

export default defineHandler(() => {
	const urls = paths
		.map((path) => `  <url><loc>${new URL(path, site.url)}</loc></url>`)
		.join("\n");
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
});
