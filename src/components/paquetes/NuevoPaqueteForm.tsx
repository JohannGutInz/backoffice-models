"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { crearPaqueteAction } from "@/lib/actions";
import { crearPaqueteSchema, type CrearPaqueteData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500";

export function NuevoPaqueteForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearPaqueteData>({
    resolver: zodResolver(crearPaqueteSchema),
  });

  async function onSubmit(data: CrearPaqueteData) {
    setServerError(null);
    const result = await crearPaqueteAction(data);
    if (result.status === "error") {
      setServerError(result.message);
    } else if (result.paqueteId) {
      router.push(`${APP_ROUTE.app.packages.index}/${result.paqueteId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Nombre del paquete <span className="text-rose-500">*</span>
        </label>
        <input
          {...register("name")}
          placeholder="Ej. Propuesta Evento Tecnológico — Julio 2026"
          className={INPUT}
        />
        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Descripción</label>
        <textarea
          {...register("description")}
          placeholder="Contexto del evento, requerimientos del cliente, notas…"
          rows={3}
          className={`${INPUT} resize-none`}
        />
        <p className="mt-1 text-xs text-zinc-400">Solo visible en el backoffice, no aparece en el link público.</p>
      </div>

      {serverError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-5">
        <a
          href={APP_ROUTE.app.packages.index}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Creando…" : <><Save className="h-4 w-4" /> Crear paquete</>}
        </button>
      </div>
    </form>
  );
}
