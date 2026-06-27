import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/ui/SearchForm";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { EstadoBadge } from "@/components/ui/Badge";
import { listEventos, nombreCliente } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const eventos = await listEventos();

  const filtrados = q
    ? eventos.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q.toLowerCase()) ||
          nombreCliente(e.clienteId).toLowerCase().includes(q.toLowerCase()),
      )
    : eventos;

  const ordenados = [...filtrados].sort(
    (a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Servicios y trabajos contratados por los clientes."
        actions={
          <LinkButton href={APP_ROUTE.app.eventos.index}>
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
            {ordenados.map((evento) => (
              <Tr key={evento.id}>
                <Td className="font-medium text-zinc-900">{evento.nombre}</Td>
                <Td>{nombreCliente(evento.clienteId)}</Td>
                <Td>{evento.tipo}</Td>
                <Td className="text-zinc-500">{evento.lugar}</Td>
                <Td className="text-zinc-500">
                  {formatDate(evento.fechaInicio)}
                  {evento.fechaFin !== evento.fechaInicio ? ` – ${formatDate(evento.fechaFin)}` : ""}
                </Td>
                <Td className="text-right">{evento.bookingsIds.length}</Td>
                <Td>
                  <EstadoBadge estado={evento.estado} />
                </Td>
              </Tr>
            ))}
            {ordenados.length === 0 && (
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
