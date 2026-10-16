import { site } from "./site";

const SHARE_IMAGE = "/images/brand/og.jpg";

/** Absolute URL on the real domain, e.g. "/gallery" → "https://kclandandstump.com/gallery". */
export function absoluteUrl(path: string): string {
	return new URL(path, site.url).toString();
}

type SeoInput = { title: string; description: string; path: string };

/** Title, description, canonical URL, and social sharing tags for one page. */
export function seo({ title, description, path }: SeoInput) {
	const url = absoluteUrl(path);
	return {
		meta: [
			{ title },
			{ name: "description", content: description },
			{ property: "og:type", content: "website" },
			{ property: "og:site_name", content: site.name },
			{ property: "og:title", content: title },
			{ property: "og:description", content: description },
			{ property: "og:url", content: url },
			{ property: "og:image", content: absoluteUrl(SHARE_IMAGE) },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [{ rel: "canonical", href: url }],
	};
}

/** schema.org description of the business, for search engines. */
export function localBusinessJsonLd(settings: {
	phone: string;
	serviceArea: string[];
}): string {
	const data = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: site.name,
		url: site.url,
		image: absoluteUrl(SHARE_IMAGE),
		telephone: `+1-${settings.phone}`,
		address: {
			"@type": "PostalAddress",
			addressLocality: "Atlanta",
			addressRegion: "TX",
			addressCountry: "US",
		},
		areaServed: settings.serviceArea.map((name) => ({ "@type": "City", name })),
		sameAs: [site.facebookUrl],
	};
	// Escape "<" so text typed in the admin (like a town name containing
	// "</script>") can never break out of the script tag this goes into.
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
