import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, Clock, Link2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { getSolicitud } from "@/lib/data";
import { moderarSolicitudAction } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { EstadoBadge } from "@/components/ui/Badge";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { addDays, calcularEdad, formatDate, parseDateOnly } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

export default async function SolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const solicitud = await getSolicitud(id);

  if (!solicitud) notFound();

  const edad = calcularEdad(solicitud.fechaNacimiento);
  const purgaFecha = solicitud.rechazadoEn ? addDays(parseDateOnly(solicitud.rechazadoEn), 45) : null;

  return (
    <div>
      <Link href={APP_ROUTE.app.moderacion.index} className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Moderación
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={solicitud.nombreCompleto} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{solicitud.nombreCompleto}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <EstadoBadge estado={solicitud.estado} />
              <span>·</span>
              <span>Enviado el {formatDate(solicitud.enviadoEn)}</span>
            </div>
          </div>
        </div>
      </div>

      {edad < 18 && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertTriangle className="h-4 w-4" /> Esta solicitud indica una edad menor a 18 años — no procesar.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos enviados por el aspirante" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Correo" value={solicitud.correo} />
                <Field label="Teléfono" value={solicitud.telefono} />
                <Field label="Fecha de nacimiento" value={`${formatDate(solicitud.fechaNacimiento)} · ${edad} años`} />
                <Field label="Categoría" value={CATEGORIA_LABEL[solicitud.categoria]} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Material enviado" />
            <div className="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px]">Sin material</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Comentarios de revisión" subtitle="Dos canales separados — nunca se mezclan" />
            <form className="space-y-4 px-5 pb-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  Nota interna · solo staff
                </label>
                <textarea
                  name="notaInterna"
                  defaultValue={solicitud.notaInterna}
                  rows={3}
                  placeholder="Observaciones internas, nunca visibles para el aspirante…"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gold-700 uppercase">
                  Retroalimentación para el modelo · visible vía enlace temporal
                </label>
                <textarea
                  name="retroParaModelo"
                  defaultValue={solicitud.retroParaModelo}
                  rows={3}
                  placeholder="Lo que el aspirante verá y podrá usar para corregir y reenviar…"
                  className="w-full rounded-lg border border-gold-200 bg-gold-50 p-3 text-sm text-gold-900 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
                />
              </div>

              {solicitud.estado !== "aprobado" && solicitud.estado !== "rechazado" && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    formAction={moderarSolicitudAction.bind(null, solicitud.id, "rechazado")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 transition-colors hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200"
                  >
                    <XCircle className="h-4 w-4" /> Rechazar
                  </button>
                  <button
                    formAction={moderarSolicitudAction.bind(null, solicitud.id, "requiere_cambios")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 transition-colors hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-200"
                  >
                    <RotateCcw className="h-4 w-4" /> Solicitar cambios
                  </button>
                  <button
                    formAction={moderarSolicitudAction.bind(null, solicitud.id, "aprobado")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprobar
                  </button>
                </div>
              )}
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Enlace de revisión" subtitle="Token temporal, sin cuenta permanente" />
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate">/retro/{solicitud.tokenRevision}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                El aspirante ve sus comentarios, edita y reenvía desde este enlace — nunca crea una cuenta.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Estado del ciclo de vida" />
            <div className="px-5 pb-5 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>Última actualización: {formatDate(solicitud.actualizadoEn)}</span>
              </div>
              {solicitud.estado === "rechazado" && purgaFecha && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Rechazado el {formatDate(solicitud.rechazadoEn!)}. Se purgará automáticamente (registro e
                    imágenes en storage) el <strong>{formatDate(purgaFecha)}</strong>.
                  </span>
                </div>
              )}
              {solicitud.estado === "aprobado" && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                  Convertido en modelo activo — ya forma parte del roster y de la vitrina pública.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
