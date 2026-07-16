import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, CheckCircle2, Pencil, Trash2, ExternalLink, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { getEvent, getCurrentUser, listModels } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { cn, formatFullName } from "@/lib/utils";
import { marcarEventoCubiertoAction, eliminarEventoAction } from "@/lib/actions";

function formatDateTime(date: Date) {
  return date.toLocaleString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default async function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await params;
  const [evento, modelos] = await Promise.all([getEvent(id), listModels()]);

  if (!evento) notFound();

  const startAt = new Date(evento.startDate);
  const endAt = new Date(evento.endDate);
  const recurringDays = evento.recurringDays ?? [];
  const cubierto = evento.cubierto ?? false;
  const sameDay = startAt.toDateString() === endAt.toDateString();

  return (
    <div>
      <div className="mb-5">
        <Link
          href={APP_ROUTE.app.events.index}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Eventos
        </Link>
      </div>

      <PageHeader
        title={evento.name}
        subtitle={
          sameDay
            ? `${formatDateTime(startAt)} – ${formatTime(endAt)}`
            : `${formatDateTime(startAt)} → ${formatDateTime(endAt)}`
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <dl className="grid grid-cols-2 gap-5">
              {recurringDays.length > 0 ? (
                <>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-zinc-400">Tipo</dt>
                    <dd className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <RotateCcw className="h-3 w-3" /> Evento recurrente
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-400">Período</dt>
                    <dd className="mt-1 text-sm text-zinc-800">
                      {formatDateTime(startAt)} → {formatDateTime(endAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-400">Horario diario</dt>
                    <dd className="mt-1 text-sm text-zinc-800">
                      {evento.dailyStartTime} – {evento.dailyEndTime}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-zinc-400">Días activos</dt>
                    <dd className="mt-1 flex gap-1.5">
                      {[
                        { v: 1, l: "L" }, { v: 2, l: "M" }, { v: 3, l: "X" }, { v: 4, l: "J" },
                        { v: 5, l: "V" }, { v: 6, l: "S" }, { v: 0, l: "D" },
                      ].map((d) => (
                        <span
                          key={d.v}
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                            recurringDays.includes(d.v)
                              ? "bg-zinc-950 text-gold-300"
                              : "bg-zinc-100 text-zinc-300",
                          )}
                        >
                          {d.l}
                        </span>
                      ))}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-xs font-medium text-zinc-400">Inicio</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm text-zinc-800">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      {formatDateTime(startAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-zinc-400">Fin</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm text-zinc-800">
                      <Clock className="h-4 w-4 text-zinc-400" />
                      {formatDateTime(endAt)}
                    </dd>
                  </div>
                </>
              )}
              {evento.notas && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-zinc-400">Notas</dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-zinc-800">{evento.notas}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-800">Estado del evento</h3>

            <div className="flex items-center gap-3 mb-5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                  cubierto
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700",
                )}
              >
                {cubierto && <CheckCircle2 className="h-4 w-4" />}
                {cubierto ? "Cubierto" : "Pendiente de cubrir"}
              </span>

              {evento.modelo && (
                <Link
                  href={`${APP_ROUTE.app.models.index}/${evento.modelo.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-gold-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {formatFullName(evento.modelo)}
                </Link>
              )}
            </div>

            {!cubierto && (
              <form
                action={async (fd: FormData) => {
                  "use server";
                  const modeloId = fd.get("modeloId") as string | null;
                  await marcarEventoCubiertoAction(evento.id, true, modeloId || null);
                }}
                className="flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                    Modelo que cubre (opcional)
                  </label>
                  <select
                    name="modeloId"
                    className="rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm focus:border-gold-500 focus:outline-none"
                  >
                    <option value="">Sin asignar</option>
                    {modelos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {formatFullName(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Marcar como cubierto
                </button>
              </form>
            )}

            {cubierto && (
              <form
                action={async () => {
                  "use server";
                  await marcarEventoCubiertoAction(evento.id, false, null);
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-zinc-400 hover:text-zinc-700 underline"
                >
                  Desmarcar como cubierto
                </button>
              </form>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="divide-y divide-zinc-100">
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Acciones</p>
            </div>
            <div className="p-4">
              <Link
                href={`${APP_ROUTE.app.events.index}/${evento.id}/editar`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <Pencil className="h-4 w-4" /> Editar evento
              </Link>
            </div>
            <div className="p-4">
              <form
                action={async () => {
                  "use server";
                  await eliminarEventoAction(evento.id);
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar evento
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
