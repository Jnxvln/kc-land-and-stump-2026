import { getRouteApi } from "@tanstack/react-router";
import { TEXT_ORIGINALS } from "./editable-pages";

const rootRoute = getRouteApi("__root__");

/** Returns a lookup for page text: the published wording, or the original. */
export function usePageText(): (key: string) => string {
	const { text } = rootRoute.useLoaderData();
	return (key) => text[key] ?? TEXT_ORIGINALS[key] ?? "";
}
