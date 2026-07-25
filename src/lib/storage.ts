import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import sharp from "sharp";

function getS3Client() {
  return new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

function getBucket() {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) throw new Error("STORAGE_BUCKET is not configured");
  return bucket;
}

export async function uploadImage(
  buffer: Buffer,
  key: string,
  options?: { quality?: number; maxWidth?: number },
): Promise<string> {
  const { quality = 80, maxWidth = 1920 } = options ?? {};

  const processed = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: processed,
      ContentType: "image/webp",
    }),
  );

  return getSignedDownloadUrl(key);
}

export async function getPresignedVideoUploadPost(
  key: string,
  contentType: string,
  maxBytes: number,
): Promise<{ url: string; fields: Record<string, string> }> {
  const s3 = getS3Client();

  return createPresignedPost(s3, {
    Bucket: getBucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 0, maxBytes],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 3600,
  });
}

export async function deleteObject(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

// Signed GET URLs carry the key as their path, a bare query string as signature —
// so this also recovers the key from a URL this module signed earlier.
export function keyFromObjectUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const prefix = `/${getBucket()}/`;
    return pathname.startsWith(prefix) ? decodeURIComponent(pathname.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3Client();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn },
  );
}

export async function signAssetUrls<T extends { url: string }>(assets: T[]): Promise<T[]> {
  return Promise.all(assets.map(async (asset) => ({ ...asset, url: await getSignedDownloadUrl(asset.url) })));
}
