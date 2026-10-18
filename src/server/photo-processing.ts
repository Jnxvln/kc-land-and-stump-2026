import decodeHeic from "heic-decode";
import sharp from "sharp";

const MAX_INPUT_PIXELS = 60_000_000;

// HEIF files start with an "ftyp" box naming their format ("brand") in bytes 8–12.
const HEIC_BRANDS = new Set([
	"heic",
	"heix",
	"hevc",
	"hevx",
	"heim",
	"heis",
	"mif1",
	"msf1",
]);

function isHeic(input: Buffer): boolean {
	return (
		input.length > 12 &&
		input.toString("ascii", 4, 8) === "ftyp" &&
		HEIC_BRANDS.has(input.toString("ascii", 8, 12))
	);
}

/** Opens an upload with sharp, decoding HEIC first since sharp's prebuilt binaries can't. */
async function openImage(input: Buffer): Promise<ReturnType<typeof sharp>> {
	if (!isHeic(input)) {
		return sharp(input, {
			failOn: "error",
			limitInputPixels: MAX_INPUT_PIXELS,
		});
	}
	const { width, height, data } = await decodeHeic({ buffer: input });
	if (width * height > MAX_INPUT_PIXELS) throw new Error("Image is too large.");
	// Hand sharp the decoded pixels directly: 4 channels (red, green, blue, alpha) per pixel.
	return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
		raw: { width, height, channels: 4 },
	});
}

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
		const image = await openImage(input);
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
			"That file couldn't be read as a photo. Try a JPEG, PNG, WebP, or HEIC image.",
		);
	}
}
