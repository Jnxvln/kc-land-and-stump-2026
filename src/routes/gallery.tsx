import { createFileRoute } from "@tanstack/react-router";
import { CallTodayBand } from "#/components/CallTodayBand";
import { PhotoGallery } from "#/components/PhotoGallery";
import { galleryPhotos } from "#/lib/gallery";
import { site } from "#/lib/site";
import { container, sectionX } from "#/lib/ui";

export const Route = createFileRoute("/gallery")({
	head: () => ({
		meta: [
			{ title: `Gallery | ${site.name}` },
			{
				name: "description",
				content: `Photos of recent stump grinding, land clearing, gravel, and hauling jobs around ${site.region}.`,
			},
		],
	}),
	component: GalleryPage,
});

function GalleryPage() {
	return (
		<>
			<section className={`${sectionX} pt-14 pb-16 md:pt-20 md:pb-22`}>
				<div className={`${container} flex flex-col gap-10`}>
					<div className="flex flex-col gap-3">
						<h1 className="m-0 font-display text-[40px] leading-[1.05] font-extrabold font-stretch-expanded text-cream md:text-[56px]">
							Gallery
						</h1>
						<p className="m-0 max-w-[40em] text-xl">
							Photos from recent jobs. Tap any photo to see it full size.
						</p>
					</div>
					<PhotoGallery photos={galleryPhotos} />
				</div>
			</section>
			<CallTodayBand />
		</>
	);
}
