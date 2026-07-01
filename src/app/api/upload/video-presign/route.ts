import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getPresignedVideoUploadUrl } from "@/lib/storage";

const ALLOWED_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]);
const MAX_BYTES = 500 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const session = await verifySessionToken(token.value);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { filename?: string; contentType?: string; sizeBytes?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { filename, contentType, sizeBytes } = body;

  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  if (typeof sizeBytes === "number" && sizeBytes > MAX_BYTES) {
    return NextResponse.json({ error: "Video excede 500 MB" }, { status: 400 });
  }

  const ext = filename?.split(".").pop() ?? "mp4";
  const key = `media/videos/${randomUUID()}.${ext}`;

  try {
    const result = await getPresignedVideoUploadUrl(key, contentType);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[upload/video-presign]", err);
    return NextResponse.json({ error: "Error al generar URL de carga" }, { status: 500 });
  }
}
