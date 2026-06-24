import {
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  PackageOpen,
  Plus,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { EstadoBadge } from "@/components/ui/Badge";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { AlertList } from "@/components/dashboard/AlertList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getDashboardStats, getIngresosPorMes, getUsuarioActual, nombreEvento, nombreModelo } from "@/lib/data";
import { formatCurrency, formatDate, formatLongDate, greetingForHour } from "@/lib/utils";

export default async function DashboardPage() {
  const [usuario, stats, ingresosMensuales] = await Promise.all([
    getUsuarioActual(),
    getDashboardStats(),
    getIngresosPorMes(),
  ]);

  const now = new Date();
  const primerNombre = usuario.nombre.split(" ")[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {greetingForHour(now)}, {primerNombre}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{formatLongDate(now)}</p>
        </div>
        <LinkButton href="/bookings">
          <Plus className="h-4 w-4" /> Nuevo booking
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Bookings activos"
          value={String(stats.bookingsActivos)}
          subtitle={`${stats.bookingsConfirmados} confirmados · ${stats.bookingsPendientes} pendientes`}
          icon={ClipboardList}
          tone="zinc"
        />
        <StatCard
          title="Ingresos del mes"
          value={formatCurrency(stats.ingresosMesActual)}
          subtitle="Eventos facturados este mes"
          icon={CircleDollarSign}
          tone="emerald"
        />
        <StatCard
          title="Paquetes"
          value={String(stats.paquetesPendientes)}
          subtitle="Pendientes / enviados"
          icon={PackageOpen}
          tone="gold"
        />
        <StatCard
          title="Clientes"
          value={String(stats.clientesTotal)}
          subtitle="En el catálogo"
          icon={UsersRound}
          tone="sky"
        />
        <StatCard
          title="Solicitudes pendientes"
          value={String(stats.solicitudesPendientes)}
          subtitle="Esperando moderación"
          icon={UserPlus}
          tone="rose"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Ingresos por mes"
            subtitle="Últimos 6 meses · bookings facturados"
            action={
              <span className="text-xs text-zinc-400">
                Total: {formatCurrency(ingresosMensuales.reduce((s, m) => s + m.total, 0))}
              </span>
            }
          />
          <div className="px-2 pb-4">
            <RevenueBarChart data={ingresosMensuales} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Bookings por estatus" subtitle={`Total: ${stats.bookingsTotal} bookings`} />
          <div className="px-4 pb-5">
            <StatusDonutChart data={stats.bookingsPorEstatus} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Últimos bookings"
            action={
              <a href="/bookings" className="text-xs font-medium text-gold-700 hover:text-gold-600">
                Ver todos →
              </a>
            }
          />
          <Table>
            <THead>
              <Th>Booking</Th>
              <Th>Modelo</Th>
              <Th>Evento / Cliente</Th>
              <Th>Estatus</Th>
              <Th className="text-right">Tarifa</Th>
              <Th>Fecha</Th>
            </THead>
            <tbody>
              {stats.ultimosBookings.map((booking) => {
                const evento = nombreEvento(booking.eventoId);
                return (
                  <Tr key={booking.id}>
                    <Td className="font-medium text-gold-700">{booking.id.replace("bkg_", "BK-").toUpperCase()}</Td>
                    <Td>{nombreModelo(booking.modeloId)}</Td>
                    <Td>
                      <span className="block text-zinc-700">{evento}</span>
                    </Td>
                    <Td>
                      <EstadoBadge estado={booking.estado} />
                    </Td>
                    <Td className="text-right font-medium text-zinc-900">{formatCurrency(booking.tarifa)}</Td>
                    <Td className="text-zinc-500">{formatDate(booking.fecha)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-4">
          <AlertList
            items={[
              {
                icon: UserPlus,
                tone: "rose",
                title: `${stats.solicitudesPendientes} solicitudes pendientes`,
                subtitle: "Esperando moderación",
                href: "/moderacion",
              },
              {
                icon: CalendarClock,
                tone: "amber",
                title: `${stats.bookingsPendientes} bookings sin confirmar`,
                subtitle: "Pendientes de confirmación del modelo",
                href: "/bookings",
              },
              {
                icon: PackageOpen,
                tone: "sky",
                title: `${stats.paquetesBorrador} paquetes sin enviar`,
                subtitle: "En borrador, listos para el cliente",
                href: "/paquetes",
              },
            ]}
          />

          <QuickActions
            items={[
              { icon: UserRoundPlus, label: "Nuevo modelo", href: "/modelos" },
              { icon: Sparkles, label: "Nuevo evento", href: "/eventos" },
              { icon: ClipboardList, label: "Nuevo booking", href: "/bookings" },
              { icon: ShieldCheck, label: "Revisar solicitudes", href: "/moderacion" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
