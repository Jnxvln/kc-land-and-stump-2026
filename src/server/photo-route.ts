import { defineHandler, getRouterParam } from "nitro/h3";
import { isPhotoVariant, photoKey } from "../lib/photos";
import { getObject } from "./storage";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const notFound = () => new Response("Not found", { status: 404 });

export default defineHandler(async (event) => {
	const id = getRouterParam(event, "id") ?? "";
	const variant = getRouterParam(event, "variant") ?? "";
	if (!UUID.test(id) || !isPhotoVariant(variant)) return notFound();

	try {
		const object = await getObject(photoKey(id, variant));
		if (!object.Body) return notFound();

		return new Response(object.Body.transformToWebStream(), {
			headers: {
				"Content-Type": "image/webp",
				"Cache-Control": "public, max-age=31536000, immutable",
				...(object.ContentLength
					? { "Content-Length": String(object.ContentLength) }
					: {}),
			},
		});
	} catch (error) {
		if (error instanceof Error && error.name === "NoSuchKey") return notFound();
		throw error;
	}
});
