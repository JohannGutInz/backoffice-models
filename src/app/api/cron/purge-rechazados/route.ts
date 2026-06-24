import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { solicitudesRegistro } from "@/lib/mock-data";
import { addDays, parseDateOnly } from "@/lib/utils";

// Job de purga programada (CLAUDE-proyecto-real.md): las solicitudes rechazadas
// se eliminan 45 días después del rechazo — registro Y archivos de storage.
// Protegido con CRON_SECRET para que no sea un endpoint de borrado público abierto.
// Programado en vercel.json para correr diariamente.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const hoy = new Date();
  const purgados: string[] = [];

  for (let i = solicitudesRegistro.length - 1; i >= 0; i--) {
    const solicitud = solicitudesRegistro[i];
    if (solicitud.estado !== "rechazado" || !solicitud.rechazadoEn) continue;

    const fechaPurga = addDays(parseDateOnly(solicitud.rechazadoEn), 45);
    if (hoy >= fechaPurga) {
      // En producción esto borraría también los objetos en S3/R2/GCS referenciados
      // por fotoUrl/bookUrls — aquí no hay storage real conectado, solo se registra.
      console.log(
        `[storage] Purgando archivos de la solicitud ${solicitud.id} (foto: ${solicitud.fotoUrl || "ninguna"})`,
      );
      solicitudesRegistro.splice(i, 1);
      purgados.push(solicitud.id);
    }
  }

  if (purgados.length > 0) revalidatePath("/moderacion");

  return NextResponse.json({ purgedCount: purgados.length, ids: purgados });
}
