import Link from "next/link";
import { Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { listEventos, getUsuarioActual } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { cn, modelNombreCompleto } from "@/lib/utils";

function formatRange(startAt: Date, endAt: Date) {
  const sameDay =
    startAt.getFullYear() === endAt.getFullYear() &&
    startAt.getMonth() === endAt.getMonth() &&
    startAt.getDate() === endAt.getDate();

  const dateOpts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  const locale = "es-MX";

  if (sameDay) {
    return `${startAt.toLocaleDateString(locale, dateOpts)} · ${startAt.toLocaleTimeString(locale, timeOpts)}–${endAt.toLocaleTimeString(locale, timeOpts)}`;
  }
  return `${startAt.toLocaleDateString(locale, dateOpts)} → ${endAt.toLocaleDateString(locale, dateOpts)}`;
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await getUsuarioActual();
  const { q } = await searchParams;
  const eventos = await listEventos();

  const filtrados = q
    ? eventos.filter((e) => e.nombre.toLowerCase().includes(q.toLowerCase()))
    : eventos;

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Convocatorias y trabajos del equipo de talento."
        actions={
          <LinkButton href={APP_ROUTE.app.eventos.nuevo}>
            <Plus className="h-4 w-4" /> Nuevo evento
          </LinkButton>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Evento</Th>
            <Th>Fechas</Th>
            <Th>Modelo asignado</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {filtrados.map((evento) => (
              <Tr key={evento.id}>
                <Td>
                  <Link
                    href={`${APP_ROUTE.app.eventos.index}/${evento.id}`}
                    className="font-medium text-zinc-900 hover:text-gold-600"
                  >
                    {evento.nombre}
                  </Link>
                  {evento.notas && (
                    <p className="mt-0.5 truncate text-xs text-zinc-400">{evento.notas}</p>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-zinc-500 text-sm">
                  {formatRange(evento.startAt, evento.endAt)}
                </Td>
                <Td className="text-sm text-zinc-500">
                  {evento.modelo ? modelNombreCompleto(evento.modelo) : "—"}
                </Td>
                <Td>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      evento.cubierto
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700",
                    )}
                  >
                    {evento.cubierto && <CheckCircle2 className="h-3 w-3" />}
                    {evento.cubierto ? "Cubierto" : "Pendiente"}
                  </span>
                </Td>
                <Td>
                  <Link
                    href={`${APP_ROUTE.app.eventos.index}/${evento.id}`}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
                  >
                    Ver <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Td>
              </Tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-zinc-400">
                  {q ? "Ningún evento coincide con la búsqueda." : "No hay eventos registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
