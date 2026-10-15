import {
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is required`);
	return value;
}

// Created on first use, so importing this file never fails just because
// variables are missing (for example, during a build).
let client: S3Client | undefined;

function s3(): S3Client {
	client ??= new S3Client({
		endpoint: requireEnv("S3_ENDPOINT"),
		region: requireEnv("S3_REGION"),
		credentials: {
			accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
			secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
		},
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
	});
	return client;
}

const bucket = () => requireEnv("S3_BUCKET");

export async function putObject(
	key: string,
	body: Buffer,
	contentType: string,
) {
	await s3().send(
		new PutObjectCommand({
			Bucket: bucket(),
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function getObject(key: string) {
	return s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function deleteObjects(keys: string[]) {
	if (keys.length === 0) return;
	await s3().send(
		new DeleteObjectsCommand({
			Bucket: bucket(),
			Delete: { Objects: keys.map((Key) => ({ Key })) },
		}),
	);
}
