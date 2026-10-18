import { getRouteApi } from "@tanstack/react-router";
import { createContext, useContext } from "react";
import { TEXT_ORIGINALS } from "./editable-pages";

const rootRoute = getRouteApi("__root__");

const PreviewTextContext = createContext<Record<string, string> | null>(null);

/** Wraps a page being previewed, so its draft wording replaces the published wording. */
export const PreviewTextProvider = PreviewTextContext.Provider;

/** Returns a lookup for page text: preview draft, then published wording, then the original. */
export function usePageText(): (key: string) => string {
	const { text } = rootRoute.useLoaderData();
	const preview = useContext(PreviewTextContext);
	return (key) => preview?.[key] ?? text[key] ?? TEXT_ORIGINALS[key] ?? "";
}
