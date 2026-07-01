import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { listBookings, listEvents, clientName, eventName, modelName } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const active = estado ?? "todas";
  const [bookings, events] = await Promise.all([listBookings(), listEvents()]);

  const counts: Record<string, number> = {
    todas: bookings.length,
    pendiente: bookings.filter((b) => b.status === "pendiente").length,
    confirmado: bookings.filter((b) => b.status === "confirmado").length,
    completado: bookings.filter((b) => b.status === "completado").length,
    cancelado: bookings.filter((b) => b.status === "cancelado").length,
  };

  const eventById = new Map(events.map((e) => [e.id, e]));
  const filtered = active === "todas" ? bookings : bookings.filter((b) => b.status === active);
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        active={active}
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
            {sorted.map((booking) => {
              const event = eventById.get(booking.eventId);
              return (
                <Tr key={booking.id}>
                  <Td className="font-medium text-gold-700">{booking.id.replace("bkg_", "BK-").toUpperCase()}</Td>
                  <Td>{modelName(booking.modelId)}</Td>
                  <Td>{eventName(booking.eventId)}</Td>
                  <Td className="text-zinc-500">{event ? clientName(event.clientId) : "—"}</Td>
                  <Td className="text-zinc-500">{formatDate(booking.date)}</Td>
                  <Td className="text-right font-medium text-zinc-900">{formatCurrency(booking.rate)}</Td>
                  <Td>
                    <StatusBadge status={booking.status} />
                  </Td>
                </Tr>
              );
            })}
            {sorted.length === 0 && (
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
