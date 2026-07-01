"use client";

import { useState } from "react";
import { createCategoryAction } from "@/lib/actions";
import { categorySchema, type CategoryData } from "@/lib/schemas";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
        <Input
          id="name"
          label="Nombre"
          {...register("name")}
          type="text"
          placeholder="Ej. Fitness, Editorial, Comercial…"
          error={errors.name?.message}
        />

        {serverMessage && (
          <p className={`text-sm ${serverMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {serverMessage.text}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Crear catálogo"}
        </Button>
      </form>
    </Card>
  );
}
