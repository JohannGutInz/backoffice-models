"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContactoAction, type ActionState } from "@/lib/actions";

const initialState: ActionState = { status: "idle", message: "" };

export function ContactoForm({ defaultMensaje }: { defaultMensaje?: string }) {
  const [state, formAction, pending] = useActionState(submitContactoAction, initialState);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot anti-bot: oculto para personas, los bots suelen rellenarlo */}
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre</label>
          <input
            name="nombre"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Empresa</label>
          <input
            name="empresa"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
        <input
          type="email"
          name="correo"
          required
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Mensaje</label>
        <textarea
          name="mensaje"
          required
          rows={5}
          defaultValue={defaultMensaje}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-rose-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensaje"} <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
