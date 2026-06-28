"use client";

import { useState } from "react";
import { createCategoryAction } from "@/lib/actions";
import { categorySchema, type CategoryData } from "@/lib/schemas";
import { Card, CardHeader } from "@/components/ui/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function CatalogForm() {
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryData>({ resolver: zodResolver(categorySchema) });

  async function onSubmit(data: CategoryData) {
    setServerMessage(null);
    const result = await createCategoryAction(data);
    if (result.status === "success") {
      reset();
      setServerMessage({ type: "success", text: result.message });
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  }

  return (
    <Card>
      <CardHeader title="Nuevo catálogo" subtitle="Agrega una categoría disponible para los modelos." />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 pb-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Nombre
          </label>
          <input
            id="name"
            {...register("name")}
            type="text"
            placeholder="Ej. Fitness, Editorial, Comercial…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
        </div>

        {serverMessage && (
          <p className={`text-sm ${serverMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {serverMessage.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Crear catálogo"}
        </button>
      </form>
    </Card>
  );
}
