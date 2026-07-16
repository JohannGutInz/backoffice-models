import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EditEventoForm } from "@/components/eventos/EditEventoForm";
import { getEvent, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import type { EventoFormData } from "@/lib/schemas";

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await params;
  const evento = await getEvent(id);

  if (!evento) notFound();

  const recurringDays = evento.recurringDays ?? [];
  const startAt = new Date(evento.startDate);
  const endAt = new Date(evento.endDate);
  const isRecurring = recurringDays.length > 0;

  const defaultValues: Partial<EventoFormData> = isRecurring
    ? {
        nombre: evento.name,
        notas: evento.notas ?? "",
        isRecurring: true,
        recurringDays,
        dailyStartTime: evento.dailyStartTime ?? "09:00",
        dailyEndTime: evento.dailyEndTime ?? "18:00",
        rangeStart: toDateString(startAt),
        rangeEnd: toDateString(endAt),
      }
    : {
        nombre: evento.name,
        notas: evento.notas ?? "",
        isRecurring: false,
        startDate: toDateString(startAt),
        startTime: toTimeString(startAt),
        endDate: toDateString(endAt),
        endTime: toTimeString(endAt),
        recurringDays: [],
      };

  return (
    <div>
      <div className="mb-5">
        <Link
          href={`${APP_ROUTE.app.events.index}/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> {evento.name}
        </Link>
      </div>

      <PageHeader title="Editar evento" subtitle={evento.name} />

      <Card className="max-w-2xl p-6">
        <EditEventoForm eventoId={id} defaultValues={defaultValues} />
      </Card>
    </div>
  );
}
