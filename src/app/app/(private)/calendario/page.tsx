import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { listBookings, eventName, modelName, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { toDateKey, formatDate, formatMonthYear } from "@/lib/utils";
import type { Booking } from "@/lib/types";

function parseMonthParam(param: string | undefined, fallback: Date) {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month: month - 1 };
  }
  return { year: fallback.getFullYear(), month: fallback.getMonth() };
}

function toMonthParam(year: number, month: number) {
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await getCurrentUser();
  const { month: monthParamValue } = await searchParams;
  const today = new Date();
  const { year, month } = parseMonthParam(monthParamValue, today);

  const bookings = await listBookings();
  const bookingsByDate = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = bookingsByDate.get(booking.date) ?? [];
    list.push(booking);
    bookingsByDate.set(booking.date, list);
  }

  const todayKey = toDateKey(today);
  const upcoming = [...bookings]
    .filter((b) => b.date >= todayKey && b.status !== "cancelado")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const prevDate = new Date(year, month - 1, 1);
  const nextDate = new Date(year, month + 1, 1);
  const prevParam = toMonthParam(prevDate.getFullYear(), prevDate.getMonth());
  const nextParam = toMonthParam(nextDate.getFullYear(), nextDate.getMonth());
  const currentParam = toMonthParam(today.getFullYear(), today.getMonth());

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Vista mensual de eventos y convocatorias."
        actions={
          <Link
            href={`${APP_ROUTE.app.events.index}/nuevo`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" /> Nuevo evento
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="text-sm font-semibold text-zinc-900">{formatMonthYear(new Date(year, month, 1))}</h3>
            <div className="flex items-center gap-1.5">
              <Link
                href={`${APP_ROUTE.app.calendar.index}?month=${currentParam}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100"
              >
                Hoy
              </Link>
              <Link
                href={`${APP_ROUTE.app.calendar.index}?month=${prevParam}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`${APP_ROUTE.app.calendar.index}?month=${nextParam}`}
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
            {upcoming.map((booking) => (
              <li key={booking.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900">{formatDate(booking.date)}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {modelName(booking.modelId)} · {eventName(booking.eventId)}
                </p>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-zinc-400">Sin bookings próximos.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
