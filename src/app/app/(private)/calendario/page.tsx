import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CalendarioClient } from "@/components/calendario/CalendarioClient";
import { listEventosRango, getUsuarioActual } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { toDateKey } from "@/lib/utils";
import type { SerializedEvento } from "@/lib/calendar-utils";

function parseMonthParam(monthParam: string | undefined, fallback: Date) {
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    return { year, month: month - 1 };
  }
  return { year: fallback.getFullYear(), month: fallback.getMonth() };
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await getUsuarioActual();
  const { month: monthParamValue } = await searchParams;
  const today = new Date();
  const { year, month } = parseMonthParam(monthParamValue, today);

  // Fetch a range slightly wider than the month to capture multi-day events that start before/end after
  const rangeStart = new Date(year, month - 1, 25);
  const rangeEnd = new Date(year, month + 1, 10);

  const eventos = await listEventosRango(rangeStart, rangeEnd);

  const serialized: SerializedEvento[] = eventos.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    cubierto: e.cubierto,
    recurringDays: e.recurringDays,
    dailyStartTime: e.dailyStartTime,
    dailyEndTime: e.dailyEndTime,
    modelo: e.modelo
      ? {
          id: e.modelo.id,
          firstName: e.modelo.firstName,
          lastNameP: e.modelo.lastNameP,
          lastNameM: e.modelo.lastNameM,
        }
      : null,
  }));

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Vista mensual de eventos y convocatorias."
        actions={
          <LinkButton href={APP_ROUTE.app.eventos.nuevo}>
            <Plus className="h-4 w-4" /> Nuevo evento
          </LinkButton>
        }
      />

      <Card className="p-5">
        <CalendarioClient
          year={year}
          month={month}
          eventos={serialized}
          todayKey={toDateKey(today)}
          eventoBaseUrl={APP_ROUTE.app.eventos.index}
        />
      </Card>
    </div>
  );
}
