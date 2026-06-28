"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { reenviarSolicitudAction } from "@/lib/actions";
import { reenviarSchema, type ReenviarData } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ReenviarSolicitudForm({
  token,
  nombreCompleto,
  correo,
  telefono,
}: {
  token: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
}) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReenviarData>({
    resolver: zodResolver(reenviarSchema),
    defaultValues: { nombreCompleto, correo, telefono },
  });

  async function onSubmit(data: ReenviarData) {
    setServerError(null);
    const result = await reenviarSolicitudAction(token, data);
    if (result.status === "error") setServerError(result.message);
    else setSuccess(result.message);
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre completo</label>
        <input
          {...register("nombreCompleto")}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
        {errors.nombreCompleto && <p className="mt-1 text-xs text-rose-600">{errors.nombreCompleto.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
          <input
            type="email"
            {...register("correo")}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          {errors.correo && <p className="mt-1 text-xs text-rose-600">{errors.correo.message}</p>}
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

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {isSubmitting ? "Reenviando…" : "Reenviar para revisión"} <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
