"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, RotateCcw } from "lucide-react";
import { eventoFormSchema, type EventoFormData } from "@/lib/schemas";
import { crearEventoAction, editarEventoAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";
const TEXTAREA =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 resize-none";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}
function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-rose-600">{msg}</p>;
}

// Mon–Sun order; values match JS Date.getDay() (0=Sun,1=Mon…6=Sat)
const WEEK_DAYS = [
  { label: "L", value: 1, title: "Lunes" },
  { label: "M", value: 2, title: "Martes" },
  { label: "X", value: 3, title: "Miércoles" },
  { label: "J", value: 4, title: "Jueves" },
  { label: "V", value: 5, title: "Viernes" },
  { label: "S", value: 6, title: "Sábado" },
  { label: "D", value: 0, title: "Domingo" },
];

interface Props {
  mode: "create" | "edit";
  eventoId?: string;
  defaultValues?: Partial<EventoFormData>;
  redirectOnSuccess?: string;
}

export function EventoForm({ mode, eventoId, defaultValues, redirectOnSuccess }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoFormSchema),
    defaultValues: {
      nombre: "",
      notas: "",
      isRecurring: false,
      startDate: today,
      startTime: "09:00",
      endDate: today,
      endTime: "18:00",
      recurringDays: [],
      dailyStartTime: "09:00",
      dailyEndTime: "18:00",
      rangeStart: today,
      rangeEnd: today,
      ...defaultValues,
    },
  });

  const isRecurring = watch("isRecurring");
  const recurringDays = watch("recurringDays");

  async function onSubmit(data: EventoFormData) {
    setServerError(null);
    const result =
      mode === "create"
        ? await crearEventoAction(data)
        : await editarEventoAction(eventoId!, data);

    if (result.status === "error") {
      setServerError(result.message);
      return;
    }

    const dest =
      redirectOnSuccess ??
      (mode === "create" && "eventoId" in result && result.eventoId
        ? `${APP_ROUTE.app.eventos.index}/${result.eventoId}`
        : APP_ROUTE.app.eventos.index);

    router.push(dest);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div>
        <Label required>Nombre del evento / convocatoria</Label>
        <input {...register("nombre")} className={INPUT} placeholder="Ej. Catálogo Verano 2026" />
        <Err msg={errors.nombre?.message} />
      </div>

      {/* Toggle recurrencia */}
      <Controller
        control={control}
        name="isRecurring"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => field.onChange(!field.value)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                field.value ? "bg-gold-500" : "bg-zinc-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  field.value ? "left-4" : "left-0.5",
                )}
              />
            </div>
            <span className="text-sm font-medium text-zinc-700">
              Evento recurrente (repite ciertos días de la semana)
            </span>
          </label>
        )}
      />

      {isRecurring ? (
        /* ---- Recurring mode ---- */
        <div className="space-y-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          {/* Day picker */}
          <div>
            <Label required>Días de la semana</Label>
            <Controller
              control={control}
              name="recurringDays"
              render={({ field }) => (
                <div className="mt-2 flex gap-2">
                  {WEEK_DAYS.map((d) => {
                    const active = field.value.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        title={d.title}
                        onClick={() => {
                          const next = active
                            ? field.value.filter((v) => v !== d.value)
                            : [...field.value, d.value];
                          field.onChange(next);
                        }}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                          active
                            ? "bg-zinc-950 text-gold-300"
                            : "bg-white text-zinc-500 ring-1 ring-zinc-300 hover:bg-zinc-100",
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            <Err msg={errors.recurringDays?.message as string | undefined} />
          </div>

          {/* Daily time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Hora de inicio (cada día)</Label>
              <input type="time" {...register("dailyStartTime")} className={INPUT} />
              <Err msg={errors.dailyStartTime?.message} />
            </div>
            <div>
              <Label required>Hora de fin (cada día)</Label>
              <input type="time" {...register("dailyEndTime")} className={INPUT} />
              <Err msg={errors.dailyEndTime?.message} />
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Fecha de inicio del período</Label>
              <input type="date" {...register("rangeStart")} className={INPUT} />
              <Err msg={errors.rangeStart?.message} />
            </div>
            <div>
              <Label required>Fecha de fin del período</Label>
              <input type="date" {...register("rangeEnd")} className={INPUT} />
              <Err msg={errors.rangeEnd?.message} />
            </div>
          </div>

          {/* Preview */}
          {recurringDays.length > 0 && (
            <p className="text-xs text-zinc-500">
              Repite los días{" "}
              <strong>
                {WEEK_DAYS.filter((d) => recurringDays.includes(d.value))
                  .map((d) => d.title)
                  .join(", ")}
              </strong>{" "}
              en el período seleccionado.
            </p>
          )}
        </div>
      ) : (
        /* ---- One-time event mode ---- */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Fecha de inicio</Label>
              <input type="date" {...register("startDate")} className={INPUT} />
              <Err msg={errors.startDate?.message} />
            </div>
            <div>
              <Label required>Hora de inicio</Label>
              <input type="time" {...register("startTime")} className={INPUT} />
              <Err msg={errors.startTime?.message} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Fecha de fin</Label>
              <input type="date" {...register("endDate")} className={INPUT} />
              <Err msg={errors.endDate?.message} />
            </div>
            <div>
              <Label required>Hora de fin</Label>
              <input type="time" {...register("endTime")} className={INPUT} />
              <Err msg={errors.endTime?.message} />
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      <div>
        <Label>Notas</Label>
        <textarea
          {...register("notas")}
          className={TEXTAREA}
          rows={3}
          placeholder="Detalles adicionales del evento..."
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</p>
      )}

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5">
        <Button variant="secondary" type="button" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4" />
          {isSubmitting
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? "Crear evento"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
