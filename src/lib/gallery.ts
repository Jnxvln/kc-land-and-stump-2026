export type GalleryPhoto = {
	key: string;
	thumb: string;
	full: string;
	alt: string;
};

const staticPhoto = (src: string, alt: string): GalleryPhoto => ({
	key: src,
	thumb: src,
	full: src,
	alt,
});

// Shown only until real photos have been uploaded.
export const staticGalleryPhotos: GalleryPhoto[] = [
	staticPhoto("/images/services/stump/stump-ckuh.webp", "Stump grinding job"),
	staticPhoto("/images/services/land/land-ijucu2.webp", "Land clearing job"),
	staticPhoto(
		"/images/services/gravel/gravel-x81s.webp",
		"Gravel spreading job",
	),
	staticPhoto("/images/services/dirtwork/dirtwork-c9818.webp", "Dirt work job"),
	staticPhoto("/images/services/dirtwork/dirtwork-cia03.webp", "Dirt work job"),
	staticPhoto("/images/services/dirtwork/dirtwork-j381u.webp", "Dirt work job"),
	staticPhoto("/images/services/stump/stump-fdi2.webp", "Stump grinding job"),
	staticPhoto("/images/services/stump/stump-d81.webp", "Stump grinding job"),
	staticPhoto("/images/services/land/land-i381u.webp", "Land clearing job"),
	staticPhoto(
		"/images/services/gravel/gravel-k3401.webp",
		"Gravel spreading job",
	),
	staticPhoto("/images/services/dirtwork/dirtwork-fi1ds.webp", "Dirt work job"),
	staticPhoto(
		"/images/services/hauling/hauling-e81iz.webp",
		"Truck and dump trailer",
	),
];
