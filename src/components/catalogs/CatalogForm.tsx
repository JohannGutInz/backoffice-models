"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ActionState, createCategoryAction } from "@/lib/actions";
import { Card, CardHeader } from "@/components/ui/Card";

const initialState: ActionState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Crear catálogo"}
    </button>
  );
}

export function CatalogForm() {
  const [state, formAction] = useActionState(createCategoryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader title="Nuevo catálogo" subtitle="Agrega una categoría disponible para los modelos." />
      <form ref={formRef} action={formAction} className="space-y-4 px-5 pb-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ej. Fitness, Editorial, Comercial…"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>

        {state.status === "error" && (
          <p className="text-sm text-rose-600">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-sm text-emerald-600">{state.message}</p>
        )}

        <SubmitButton />
      </form>
    </Card>
  );
}
