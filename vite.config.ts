import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
			// Photos are served by a Nitro handler rather than a TanStack route: Nitro's
			// dev server treats requests with Sec-Fetch-Dest: image as static assets and
			// skips app routes, unless the path matches a handler registered here.
			handlers: [
				{
					route: "/photos/:id/:variant",
					handler: "./src/server/photo-route.ts",
				},
			],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
