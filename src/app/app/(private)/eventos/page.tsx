import Link from "next/link";
import { Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { listEvents, clientName, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { cn, formatFullName, formatDate } from "@/lib/utils";

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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await getCurrentUser();
  const { q } = await searchParams;
  const events = await listEvents();

  const filtered = q
    ? events.filter(
        (e) =>
          e.name.toLowerCase().includes(q.toLowerCase()) ||
          clientName(e.clientId).toLowerCase().includes(q.toLowerCase()),
      )
    : events;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Convocatorias y trabajos del equipo de talento."
        actions={
          <LinkButton href={APP_ROUTE.app.events.index}>
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
            {sorted.map((event) => (
              <Tr key={event.id}>
                <Td className="font-medium text-zinc-900">{event.name}</Td>
                <Td>{clientName(event.clientId)}</Td>
                <Td>{event.type}</Td>
                <Td className="text-zinc-500">{event.venue}</Td>
                <Td className="text-zinc-500">
                  {formatDate(event.startDate)}
                  {event.endDate !== event.startDate ? ` – ${formatDate(event.endDate)}` : ""}
                </Td>
                <Td className="text-right">{event.bookingIds.length}</Td>
                <Td>
                  <StatusBadge status={event.status} />
                </Td>
              </Tr>
            ))}
            {sorted.length === 0 && (
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
