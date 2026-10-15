import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { noindexStaging } from "./middleware/noindex-staging";

const csrf = createCsrfMiddleware({
	filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
	requestMiddleware: [noindexStaging, csrf],
}));
