"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { actualizarPerfilModeloAction } from "@/lib/actions";
import { perfilModeloSchema, type PerfilModeloData } from "@/lib/schemas";
import type { ModelWithRelations } from "@/lib/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function PerfilModeloForm({ modelo }: { modelo: ModelWithRelations }) {
  const [mensaje, setMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PerfilModeloData>({
    resolver: zodResolver(perfilModeloSchema),
    defaultValues: { telefono: modelo.phone },
  });

  async function onSubmit(data: PerfilModeloData) {
    setMensaje(null);
    const result = await actualizarPerfilModeloAction(data);
    setMensaje(result.message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="space-y-4 px-5 pb-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre completo</label>
            <input
              disabled
              value={modelo.fullName}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
            <input
              disabled
              value={modelo.email}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Teléfono</label>
            <input
              {...register("telefono")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.telefono && <p className="mt-1 text-xs text-rose-600">{errors.telefono.message}</p>}
          </div>
        </div>
      </Card>

      {mensaje && <p className="text-sm text-zinc-600">{mensaje}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
