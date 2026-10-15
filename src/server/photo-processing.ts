import sharp from "sharp";

export class InvalidImageError extends Error {}

export type ProcessedPhoto = {
	large: Buffer;
	thumb: Buffer;
	width: number;
	height: number;
};

export async function processPhoto(
	input: Buffer,
	rotateBy?: 90 | 270,
): Promise<ProcessedPhoto> {
	try {
		const image = sharp(input, {
			failOn: "error",
			limitInputPixels: 60_000_000,
		});
		// No angle: apply the phone's orientation flag. With an angle: rotate by that.
		const base = rotateBy ? image.rotate(rotateBy) : image.rotate();

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
