import { getRouteApi } from "@tanstack/react-router";

const rootRoute = getRouteApi("__root__");

/** Phone number and service area, loaded once by the root route. */
export function useSiteSettings() {
	return rootRoute.useLoaderData();
}
