import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import {
	discardPageDraft,
	getPageEditor,
	type PageContent,
	publishPageDraft,
	savePageDraft,
} from "#/functions/pages";
import type { AdminPhoto } from "#/functions/photos";
import type { EditablePage, PageBlock } from "#/lib/editable-pages";
import { photoUrl } from "#/lib/photos";
import { PhotoPicker } from "./PhotoPicker";

const AUTOSAVE_DELAY_MS = 1000;

type Status =
	| { kind: "clean" }
	| { kind: "pending" }
	| { kind: "saving" }
	| { kind: "saved"; at: Date }
	| { kind: "published" }
	| { kind: "error"; message: string };

type ResolvedPhoto =
	| { kind: "yours"; src: string; alt: string; hidden: boolean }
	| { kind: "original"; src: string; alt: string }
	| { kind: "none" };

const secondaryButton =
	"min-h-12 cursor-pointer rounded-md border-[1.5px] border-line-strong bg-transparent px-4 font-semibold text-gold hover:border-gold disabled:cursor-default disabled:opacity-50";
const primaryLight =
	"min-h-12 cursor-pointer rounded-md border-0 bg-cream px-4 font-bold text-ground disabled:cursor-default disabled:opacity-50";

export function PageEditor({
	page,
	live,
	draft,
	photos,
	serviceSlug,
}: {
	page: EditablePage;
	live: PageContent;
	draft: { content: PageContent; updatedAt: Date } | null;
	photos: AdminPhoto[];
	serviceSlug?: string;
}) {
	const router = useRouter();
	const [content, setContent] = useState<PageContent>(draft?.content ?? live);
	const [status, setStatus] = useState<Status>(
		draft ? { kind: "saved", at: draft.updatedAt } : { kind: "clean" },
	);
	const [hasDraft, setHasDraft] = useState(draft !== null);
	const [busy, setBusy] = useState<"publish" | "discard" | null>(null);
	const [pickerFor, setPickerFor] = useState<PageBlock | null>(null);

	// The latest unsaved content, and the autosave timer. Refs, because changing
	// them shouldn't re-render anything.
	const pending = useRef<PageContent | null>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	async function flush() {
		clearTimeout(timer.current);
		const toSave = pending.current;
		if (!toSave) return;
		pending.current = null;
		setStatus({ kind: "saving" });
		try {
			const { updatedAt } = await savePageDraft({
				data: { page: page.id, content: toSave },
			});
			setHasDraft(true);
			// More edits may have arrived while saving; they'll trigger their own save.
			if (!pending.current) setStatus({ kind: "saved", at: updatedAt });
		} catch (err) {
			pending.current ??= toSave;
			setStatus({ kind: "error", message: (err as Error).message });
		}
	}

	function change(next: PageContent) {
		setContent(next);
		pending.current = next;
		setStatus({ kind: "pending" });
		clearTimeout(timer.current);
		timer.current = setTimeout(() => void flush(), AUTOSAVE_DELAY_MS);
	}

	// Save anything still pending when leaving the page, and warn before closing the tab mid-save.
	useEffect(() => {
		const warn = (e: BeforeUnloadEvent) => {
			if (pending.current) e.preventDefault();
		};
		window.addEventListener("beforeunload", warn);
		return () => {
			window.removeEventListener("beforeunload", warn);
			clearTimeout(timer.current);
			const toSave = pending.current;
			if (toSave)
				void savePageDraft({ data: { page: page.id, content: toSave } });
		};
	}, [page.id]);

	const setText = (key: string, value: string) =>
		change({ ...content, text: { ...content.text, [key]: value } });
	const setPhoto = (spot: string, photoId: string | null) =>
		change({ ...content, photos: { ...content.photos, [spot]: photoId } });

	async function publish() {
		setBusy("publish");
		try {
			await flush();
			if (pending.current)
				throw new Error(
					"Couldn't save your latest changes. Check your connection and try again.",
				);
			await publishPageDraft({ data: { page: page.id } });
			setHasDraft(false);
			setStatus({ kind: "published" });
			await router.invalidate();
		} catch (err) {
			setStatus({ kind: "error", message: (err as Error).message });
		} finally {
			setBusy(null);
		}
	}

	async function discard() {
		if (!window.confirm("Throw away your unpublished changes to this page?"))
			return;
		setBusy("discard");
		clearTimeout(timer.current);
		pending.current = null;
		try {
			await discardPageDraft({ data: { page: page.id } });
			const fresh = await getPageEditor({ data: { page: page.id } });
			setContent(fresh.live);
			setHasDraft(false);
			setStatus({ kind: "clean" });
			await router.invalidate();
		} catch (err) {
			setStatus({ kind: "error", message: (err as Error).message });
		} finally {
			setBusy(null);
		}
	}

	const photosById = new Map(photos.map((p) => [p.id, p]));
	function resolvePhoto(block: PageBlock): ResolvedPhoto {
		if (!block.photo) return { kind: "none" };
		const id = content.photos[block.photo.spot];
		const chosen = id ? photosById.get(id) : undefined;
		if (chosen) {
			return {
				kind: "yours",
				src: photoUrl(chosen.id, "large"),
				alt: chosen.alt,
				hidden: !chosen.visible,
			};
		}
		if (block.photo.original)
			return { kind: "original", ...block.photo.original };
		return { kind: "none" };
	}

	const canPublish =
		busy === null &&
		(hasDraft || status.kind === "pending" || status.kind === "saving");

	return (
		<div className="flex flex-col gap-7">
			<div className="flex flex-col gap-2">
				<Link
					to="/admin/pages"
					className="inline-flex min-h-11 w-fit items-center text-[15px] font-bold text-muted no-underline hover:text-gold"
				>
					← All pages
				</Link>
				<div className="flex flex-wrap items-baseline justify-between gap-4">
					<h1 className="m-0 font-display text-3xl font-extrabold font-stretch-expanded text-cream md:text-4xl">
						{page.title}
					</h1>
					<a
						href={page.path}
						target="_blank"
						rel="noopener"
						className="font-bold text-tractor no-underline"
					>
						View live page ↗
					</a>
				</div>
				<p className="m-0 text-muted">
					Type right in the boxes. Leave a blank line to start a new paragraph.
					Your changes are saved as a draft as you go, and nothing appears on
					the website until you press Publish.
				</p>
			</div>

			{page.blocks.map((block) => (
				<BlockRow
					key={block.label}
					block={block}
					text={block.text ? content.text[block.text.key] : undefined}
					photo={resolvePhoto(block)}
					onText={(value) => block.text && setText(block.text.key, value)}
					onPhoto={(photoId) =>
						block.photo && setPhoto(block.photo.spot, photoId)
					}
					onChoosePhoto={() => setPickerFor(block)}
				/>
			))}

			<div className="sticky bottom-0 -mx-5 border-t border-line bg-ground px-5 py-3.5 md:-mx-8 md:px-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<output className="block font-semibold text-cream">
						<StatusText status={status} />
					</output>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={discard}
							disabled={!hasDraft || busy !== null}
							className={secondaryButton}
						>
							{busy === "discard" ? "Discarding…" : "Discard draft"}
						</button>
						<button
							type="button"
							onClick={publish}
							disabled={!canPublish}
							className="min-h-12 cursor-pointer rounded-md border-0 bg-tractor px-7 text-lg font-bold text-ground disabled:cursor-default disabled:opacity-50"
						>
							{busy === "publish" ? "Publishing…" : "Publish changes"}
						</button>
					</div>
				</div>
			</div>

			<PhotoPicker
				open={pickerFor !== null}
				title={pickerFor ? `For ${page.title} · ${pickerFor.label}` : ""}
				photos={photos}
				serviceSlug={serviceSlug}
				currentId={
					pickerFor?.photo
						? (content.photos[pickerFor.photo.spot] ?? null)
						: null
				}
				onPick={(photoId) => {
					if (pickerFor?.photo) setPhoto(pickerFor.photo.spot, photoId);
					setPickerFor(null);
				}}
				onClose={() => setPickerFor(null)}
			/>
		</div>
	);
}

function StatusText({ status }: { status: Status }) {
	switch (status.kind) {
		case "clean":
			return <>No unpublished changes</>;
		case "pending":
		case "saving":
			return <>Saving draft…</>;
		case "saved":
			return (
				<>
					✓ Draft saved{" "}
					{new Date(status.at).toLocaleTimeString([], {
						hour: "numeric",
						minute: "2-digit",
					})}{" "}
					<span className="font-normal text-muted">
						· not on the website yet
					</span>
				</>
			);
		case "published":
			return <>✓ Published. The website is updated.</>;
		case "error":
			return <span className="text-tractor">{status.message}</span>;
	}
}

function BlockRow({
	block,
	text,
	photo,
	onText,
	onPhoto,
	onChoosePhoto,
}: {
	block: PageBlock;
	text: string | undefined;
	photo: ResolvedPhoto;
	onText: (value: string) => void;
	onPhoto: (photoId: string | null) => void;
	onChoosePhoto: () => void;
}) {
	const textId = useId();
	const helpId = useId();
	const changed =
		block.text !== undefined &&
		text !== undefined &&
		text.trim() !== block.text.original.trim();

	return (
		<section
			aria-label={block.label}
			className={`grid items-start gap-6 rounded-[10px] border border-line bg-surface p-5 ${block.photo ? "md:grid-cols-2" : ""}`}
		>
			{block.text && (
				<div className="flex flex-col gap-2.5">
					<label htmlFor={textId} className="font-bold text-cream">
						{block.label}
					</label>
					{block.help && (
						<span id={helpId} className="-mt-1.5 text-[15px] text-muted">
							{block.help}
						</span>
					)}
					<textarea
						id={textId}
						aria-describedby={block.help ? helpId : undefined}
						value={text ?? ""}
						rows={block.text.rows}
						onChange={(e) => onText(e.target.value)}
						className="resize-y rounded-md border border-line-strong bg-ground px-3.5 py-3 text-base leading-relaxed text-cream"
					/>
					{changed && block.text && (
						<button
							type="button"
							onClick={() => block.text && onText(block.text.original)}
							className="min-h-11 w-fit cursor-pointer border-0 bg-transparent p-0 text-[15px] font-semibold text-muted underline"
						>
							Reset to original wording
						</button>
					)}
				</div>
			)}

			{block.photo && (
				<div className="flex flex-col gap-2.5">
					<div className="flex items-center justify-between gap-2">
						<span className="font-bold text-cream">Photo</span>
						{photo.kind === "yours" && (
							<span className="rounded bg-tractor px-2 py-0.5 text-[13px] font-bold text-ground">
								★ Your photo
							</span>
						)}
						{photo.kind === "original" && (
							<span className="rounded bg-line px-2 py-0.5 text-[13px] font-bold text-gold">
								Original photo
							</span>
						)}
					</div>

					{photo.kind === "none" ? (
						<button
							type="button"
							onClick={onChoosePhoto}
							className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-line-strong bg-ground p-4 text-center text-gold hover:border-gold"
						>
							<span className="font-bold text-cream">No photo here yet</span>
							<span className="text-[15px] text-muted">
								Click to add one. Until then, this section shows text only.
							</span>
						</button>
					) : (
						<button
							type="button"
							onClick={onChoosePhoto}
							aria-label={`Change photo for ${block.label}`}
							className="block cursor-pointer overflow-hidden rounded-lg border border-line bg-card p-0 hover:border-gold"
						>
							<img
								src={photo.src}
								alt=""
								className="block aspect-[4/3] w-full object-cover"
							/>
						</button>
					)}

					{photo.kind === "yours" && photo.hidden && (
						<p className="m-0 text-[15px] font-semibold text-tractor">
							This photo is hidden, so the original shows instead. Make it
							visible on the Photos page.
						</p>
					)}

					<div
						className={`grid gap-2.5 ${photo.kind === "yours" ? "grid-cols-2" : ""}`}
					>
						<button
							type="button"
							onClick={onChoosePhoto}
							className={primaryLight}
						>
							{photo.kind === "none" ? "Add a photo" : "Change photo"}
						</button>
						{photo.kind === "yours" && (
							<button
								type="button"
								onClick={() => onPhoto(null)}
								className={secondaryButton}
							>
								{block.photo.original ? "Use original" : "Remove photo"}
							</button>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
