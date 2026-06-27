import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { EstadoBadge } from "@/components/ui/Badge";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { listBookings, listEventos, nombreCliente, nombreEvento, nombreModelo } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const activo = estado ?? "todas";
  const [bookings, eventos] = await Promise.all([listBookings(), listEventos()]);

  const counts: Record<string, number> = {
    todas: bookings.length,
    pendiente: bookings.filter((b) => b.estado === "pendiente").length,
    confirmado: bookings.filter((b) => b.estado === "confirmado").length,
    completado: bookings.filter((b) => b.estado === "completado").length,
    cancelado: bookings.filter((b) => b.estado === "cancelado").length,
  };

  const eventoById = new Map(eventos.map((e) => [e.id, e]));
  const filtrados = activo === "todas" ? bookings : bookings.filter((b) => b.estado === activo);
  const ordenados = [...filtrados].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Contratación de un modelo para un evento — tarifa y estado propios."
        actions={
          <LinkButton href={APP_ROUTE.app.bookings.index}>
            <Plus className="h-4 w-4" /> Nuevo booking
          </LinkButton>
        }
      />

      <StatusTabs
        basePath={APP_ROUTE.app.bookings.index}
        activo={activo}
        counts={counts}
        tabs={[
          { value: "todas", label: "Todos" },
          { value: "pendiente", label: "Pendiente" },
          { value: "confirmado", label: "Confirmado" },
          { value: "completado", label: "Completado" },
          { value: "cancelado", label: "Cancelado" },
        ]}
      />

      <Card>
        <Table>
          <THead>
            <Th>Booking</Th>
            <Th>Modelo</Th>
            <Th>Evento</Th>
            <Th>Cliente</Th>
            <Th>Fecha</Th>
            <Th className="text-right">Tarifa</Th>
            <Th>Estado</Th>
          </THead>
          <tbody>
            {ordenados.map((booking) => {
              const evento = eventoById.get(booking.eventoId);
              return (
                <Tr key={booking.id}>
                  <Td className="font-medium text-gold-700">{booking.id.replace("bkg_", "BK-").toUpperCase()}</Td>
                  <Td>{nombreModelo(booking.modeloId)}</Td>
                  <Td>{nombreEvento(booking.eventoId)}</Td>
                  <Td className="text-zinc-500">{evento ? nombreCliente(evento.clienteId) : "—"}</Td>
                  <Td className="text-zinc-500">{formatDate(booking.fecha)}</Td>
                  <Td className="text-right font-medium text-zinc-900">{formatCurrency(booking.tarifa)}</Td>
                  <Td>
                    <EstadoBadge estado={booking.estado} />
                  </Td>
                </Tr>
              );
            })}
            {ordenados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-400">
                  No hay bookings en este estado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
