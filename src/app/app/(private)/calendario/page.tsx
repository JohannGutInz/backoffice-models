import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { MonthGrid } from "@/components/calendario/MonthGrid";
import { listBookings, nombreEvento, nombreModelo } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatMonthYear, toDateKey } from "@/lib/utils";
import type { Booking } from "@/lib/types";

function parseMonthParam(monthParam: string | undefined, fallback: Date) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    return { year, month: month - 1 };
  }
  return { year: fallback.getFullYear(), month: fallback.getMonth() };
}

function monthParam(year: number, month: number) {
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParamValue } = await searchParams;
  const today = new Date();
  const { year, month } = parseMonthParam(monthParamValue, today);

  const bookings = await listBookings();
  const bookingsByDate = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = bookingsByDate.get(booking.fecha) ?? [];
    list.push(booking);
    bookingsByDate.set(booking.fecha, list);
  }

  const todayKey = toDateKey(today);
  const proximos = [...bookings]
    .filter((b) => b.fecha >= todayKey && b.estado !== "cancelado")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6);

  const prevParam = monthParam(year, month - 1);
  const nextParam = monthParam(year, month + 1);
  const currentParam = monthParam(today.getFullYear(), today.getMonth());

  return (
    <div>
      <PageHeader title="Calendario / Agenda" subtitle="Bookings programados y disponibilidad del mes." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="text-sm font-semibold text-zinc-900">{formatMonthYear(new Date(year, month, 1))}</h3>
            <div className="flex items-center gap-1.5">
              <Link
                href={`${APP_ROUTE.app.calendario.index}?month=${currentParam}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
              >
                Hoy
              </Link>
              <Link
                href={`${APP_ROUTE.app.calendario.index}?month=${prevParam}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`${APP_ROUTE.app.calendario.index}?month=${nextParam}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-5">
            <MonthGrid year={year} month={month} bookingsByDate={bookingsByDate} todayKey={todayKey} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Próximos bookings" subtitle="Ordenados por fecha" />
          <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
            {proximos.map((booking) => (
              <li key={booking.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900">{formatDate(booking.fecha)}</span>
                  <EstadoBadge estado={booking.estado} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {nombreModelo(booking.modeloId)} · {nombreEvento(booking.eventoId)}
                </p>
              </li>
            ))}
            {proximos.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-zinc-400">Sin bookings próximos.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
