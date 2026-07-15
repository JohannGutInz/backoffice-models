import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { registrationApplications } from "@/lib/mock-data";
import { addDays, parseDateOnly } from "@/lib/utils";

// Scheduled purge job (CLAUDE-proyecto-real.md): rejected applications
// are deleted 45 days after rejection — record AND storage files.
// Protected with CRON_SECRET so it isn't an open public delete endpoint.
// Scheduled in vercel.json to run daily.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const today = new Date();
  const purged: string[] = [];

  for (let i = registrationApplications.length - 1; i >= 0; i--) {
    const application = registrationApplications[i];
    if (application.status !== "rechazado" || !application.rejectedAt) continue;

    const purgeDate = addDays(parseDateOnly(application.rejectedAt), 45);
    if (today >= purgeDate) {
      // In production this would also delete the objects in S3/R2/GCS referenced
      // by photoUrl/bookUrls — there's no real storage connected here, it's only logged.
      console.log(
        `[storage] Purgando archivos de la solicitud ${application.id} (foto: ${application.photoUrl || "ninguna"})`,
      );
      registrationApplications.splice(i, 1);
      purged.push(application.id);
    }
  }

  if (purged.length > 0) revalidatePath("/moderacion");

  return NextResponse.json({ purgedCount: purged.length, ids: purged });
}
