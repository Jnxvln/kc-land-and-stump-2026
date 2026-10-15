import sharp from "sharp";

export class InvalidImageError extends Error {}

export type ProcessedPhoto = {
	large: Buffer;
	thumb: Buffer;
	width: number;
	height: number;
};

export async function processPhoto(input: Buffer): Promise<ProcessedPhoto> {
	try {
		// rotate() with no arguments applies the phone's orientation flag, so
		// photos come out upright. sharp drops all metadata (EXIF, GPS, camera
		// info) from its output unless told to keep it.
		const base = sharp(input, {
			failOn: "error",
			limitInputPixels: 60_000_000,
		}).rotate();

		const [large, thumb] = await Promise.all([
			base
				.clone()
				.resize({
					width: 1600,
					height: 1600,
					fit: "inside",
					withoutEnlargement: true,
				})
				.webp({ quality: 80 })
				.toBuffer({ resolveWithObject: true }),
			base
				.clone()
				.resize({
					width: 640,
					height: 640,
					fit: "inside",
					withoutEnlargement: true,
				})
				.webp({ quality: 75 })
				.toBuffer(),
		]);

		return {
			large: large.data,
			thumb,
			width: large.info.width,
			height: large.info.height,
		};
	} catch {
		throw new InvalidImageError(
			"That file couldn't be read as a photo. Try a JPEG, PNG, or WebP image.",
		);
	}
}
