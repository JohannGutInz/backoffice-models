import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/ui/SearchForm";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { listEvents, clientName } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
        subtitle="Servicios y trabajos contratados por los clientes."
        actions={
          <LinkButton href={APP_ROUTE.app.events.index}>
            <Plus className="h-4 w-4" /> Nuevo evento
          </LinkButton>
        }
      />

      <div className="mb-5">
        <SearchForm action="/eventos" placeholder="Buscar evento o cliente…" defaultValue={q} />
      </div>

      <Card>
        <Table>
          <THead>
            <Th>Evento</Th>
            <Th>Cliente</Th>
            <Th>Tipo</Th>
            <Th>Lugar</Th>
            <Th>Fecha</Th>
            <Th className="text-right">Bookings</Th>
            <Th>Estado</Th>
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
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Ningún evento coincide con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
