import { createStart } from "@tanstack/react-start";
import { noindexStaging } from "./middleware/noindex-staging";

export const startInstance = createStart(() => ({
	requestMiddleware: [noindexStaging],
}));
