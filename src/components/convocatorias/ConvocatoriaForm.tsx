"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { convocatoriaSchema, type ConvocatoriaFormData } from "@/lib/schemas";
import { crearConvocatoriaAction, editarConvocatoriaAction } from "@/lib/actions";
import { APP_ROUTE } from "@/lib/routes";

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:bg-zinc-50";
const TEXTAREA = `${INPUT} resize-none`;
const ERROR = "mt-1 text-xs text-rose-600";
const LABEL = "mb-1.5 block text-sm font-medium text-zinc-700";
const SECTION = "rounded-xl border border-zinc-200 bg-white p-6 space-y-5";

interface Props {
  defaultValues?: Partial<ConvocatoriaFormData>;
  id?: string;
}

export function ConvocatoriaForm({ defaultValues, id }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConvocatoriaFormData>({
    resolver: zodResolver(convocatoriaSchema),
    defaultValues: {
      titulo: "",
      ciudad: "",
      tipo: "",
      fechaEvento: "",
      horario: "",
      lugar: "",
      funciones: "",
      pago: "",
      perfil: "",
      cuerpo: "",
      whatsappNumber: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: ConvocatoriaFormData) {
    setServerError(null);
    if (isEditing) {
      const result = await editarConvocatoriaAction(id, data);
      if (result.status === "error") {
        setServerError(result.message);
      } else {
        router.push(APP_ROUTE.app.convocatorias.detail(id));
      }
    } else {
      const result = await crearConvocatoriaAction(data);
      if (result.status === "error") {
        setServerError(result.message);
      } else if (result.id) {
        router.push(APP_ROUTE.app.convocatorias.detail(result.id));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identificación */}
      <div className={SECTION}>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Identificación</h2>

        <div>
          <label className={LABEL}>Título <span className="text-rose-500">*</span></label>
          <input {...register("titulo")} placeholder="Ej. Modelo para evento corporativo — CDMX" className={INPUT} />
          {errors.titulo && <p className={ERROR}>{errors.titulo.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Tipo <span className="text-rose-500">*</span></label>
            <input {...register("tipo")} placeholder="Ej. Modelo, Promotor, Edecán" className={INPUT} />
            {errors.tipo && <p className={ERROR}>{errors.tipo.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Ciudad <span className="text-rose-500">*</span></label>
            <input {...register("ciudad")} placeholder="Ej. Guadalajara, Jalisco" className={INPUT} />
            {errors.ciudad && <p className={ERROR}>{errors.ciudad.message}</p>}
          </div>
        </div>
      </div>

      {/* Fecha y lugar */}
      <div className={SECTION}>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Fecha y lugar</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Fecha del evento <span className="text-rose-500">*</span></label>
            <input {...register("fechaEvento")} type="date" className={INPUT} />
            {errors.fechaEvento && <p className={ERROR}>{errors.fechaEvento.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Horario <span className="text-rose-500">*</span></label>
            <input {...register("horario")} placeholder="Ej. 9:00 AM – 6:00 PM" className={INPUT} />
            {errors.horario && <p className={ERROR}>{errors.horario.message}</p>}
          </div>
        </div>

        <div>
          <label className={LABEL}>Lugar / Venue <span className="text-rose-500">*</span></label>
          <input {...register("lugar")} placeholder="Ej. Centro de Convenciones Banamex" className={INPUT} />
          {errors.lugar && <p className={ERROR}>{errors.lugar.message}</p>}
        </div>
      </div>

      {/* Detalles del trabajo */}
      <div className={SECTION}>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Detalles del trabajo</h2>

        <div>
          <label className={LABEL}>Funciones <span className="text-rose-500">*</span></label>
          <textarea
            {...register("funciones")}
            rows={3}
            placeholder="Describe qué hará el talento durante el evento…"
            className={TEXTAREA}
          />
          {errors.funciones && <p className={ERROR}>{errors.funciones.message}</p>}
        </div>

        <div>
          <label className={LABEL}>Perfil requerido <span className="text-rose-500">*</span></label>
          <textarea
            {...register("perfil")}
            rows={3}
            placeholder="Características, experiencia, medidas u otros requisitos…"
            className={TEXTAREA}
          />
          {errors.perfil && <p className={ERROR}>{errors.perfil.message}</p>}
        </div>

        <div>
          <label className={LABEL}>Pago <span className="text-rose-500">*</span></label>
          <input {...register("pago")} placeholder="Ej. $1,500 MXN por jornada" className={INPUT} />
          {errors.pago && <p className={ERROR}>{errors.pago.message}</p>}
        </div>
      </div>

      {/* Información adicional */}
      <div className={SECTION}>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Información adicional</h2>

        <div>
          <label className={LABEL}>Notas adicionales</label>
          <textarea
            {...register("cuerpo")}
            rows={4}
            placeholder="Detalles extra, dress code, lugar de concentración, etc."
            className={TEXTAREA}
          />
        </div>

        <div>
          <label className={LABEL}>WhatsApp de contacto <span className="text-rose-500">*</span></label>
          <input {...register("whatsappNumber")} placeholder="Ej. +52 667 123 4567" className={INPUT} />
          {errors.whatsappNumber && <p className={ERROR}>{errors.whatsappNumber.message}</p>}
          <p className="mt-1 text-xs text-zinc-400">Número al que los modelos pueden escribir para confirmar o preguntar.</p>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <a
          href={isEditing ? APP_ROUTE.app.convocatorias.detail(id) : APP_ROUTE.app.convocatorias.index}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : <><Save className="h-4 w-4" />{isEditing ? "Guardar cambios" : "Crear convocatoria"}</>}
        </button>
      </div>
    </form>
  );
}
