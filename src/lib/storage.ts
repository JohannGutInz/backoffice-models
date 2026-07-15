import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

function getPublicUrl() {
  const url = process.env.STORAGE_PUBLIC_URL;
  if (!url) throw new Error("STORAGE_PUBLIC_URL is not configured");
  return url;
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

  return `${getPublicUrl()}/${getBucket()}/${key}`;
}

export async function getPresignedVideoUploadUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; objectUrl: string }> {
  const s3 = getS3Client();
  const bucket = getBucket();

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 3600 },
  );

  return {
    uploadUrl,
    objectUrl: `${getPublicUrl()}/${bucket}/${key}`,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

export function keyFromObjectUrl(url: string): string | null {
  const prefix = `${getPublicUrl()}/${getBucket()}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3Client();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn },
  );
}
