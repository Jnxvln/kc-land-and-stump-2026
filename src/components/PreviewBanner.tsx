import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { publishPageDraft } from "#/functions/pages";

export function PreviewBanner({
	pageId,
	path,
	hasDraft,
}: {
	pageId: string;
	path: string;
	hasDraft: boolean;
}) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function publish() {
		setBusy(true);
		setError(null);
		try {
			await publishPageDraft({ data: { page: pageId } });
			await router.invalidate();
			await router.navigate({ href: path });
		} catch (err) {
			setError((err as Error).message);
			setBusy(false);
		}
	}

	return (
		<div className="sticky top-0 z-40 bg-cream px-5 py-3 text-ground md:px-16">
			<div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-3">
				<span className="font-bold">
					{hasDraft
						? "Preview · This is how the page will look. It isn't on the website yet."
						: "Preview · No unpublished changes. This is the live page."}
					{error && (
						<span className="block font-semibold text-tractor">{error}</span>
					)}
				</span>
				<div className="flex gap-3">
					<Link
						to="/admin/pages/$page"
						params={{ page: pageId }}
						className="inline-flex min-h-11 items-center rounded-md border-[1.5px] border-ground px-4 font-bold text-ground no-underline"
					>
						← Back to editing
					</Link>
					{hasDraft && (
						<button
							type="button"
							onClick={publish}
							disabled={busy}
							className="min-h-11 cursor-pointer rounded-md border-0 bg-tractor px-5 font-bold text-ground disabled:opacity-50"
						>
							{busy ? "Publishing…" : "Publish changes"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
