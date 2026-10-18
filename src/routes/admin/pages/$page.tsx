import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageEditor } from "#/components/admin/PageEditor";
import { getPageEditor } from "#/functions/pages";
import { listPhotos } from "#/functions/photos";
import { getEditablePage } from "#/lib/editable-pages";

export const Route = createFileRoute("/admin/pages/$page")({
	loader: async ({ params }) => {
		const page = getEditablePage(params.page);
		if (!page) throw notFound();
		const [editor, photos] = await Promise.all([
			getPageEditor({ data: { page: page.id } }),
			listPhotos(),
		]);
		return { ...editor, photos };
	},
	component: EditPageRoute,
});

function EditPageRoute() {
	const { page: pageId } = Route.useParams();
	const { live, draft, photos } = Route.useLoaderData();
	const page = getEditablePage(pageId);
	if (!page) return null;

	return (
		<PageEditor
			key={page.id}
			page={page}
			live={live}
			draft={draft}
			photos={photos}
			serviceSlug={page.id === "home" ? undefined : page.id}
		/>
	);
}
