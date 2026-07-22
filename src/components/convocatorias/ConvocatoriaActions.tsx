"use client";

import { useTransition } from "react";
import { Send, X, Trash2 } from "lucide-react";
import { publicarConvocatoriaAction, cerrarConvocatoriaAction, eliminarConvocatoriaAction } from "@/lib/actions";

export function PublicarButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => publicarConvocatoriaAction(id))}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
      {pending ? "Publicando…" : "Publicar"}
    </button>
  );
}

export function CerrarButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Cerrar esta convocatoria? Ya no será visible al público.")) return;
        startTransition(() => cerrarConvocatoriaAction(id));
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
    >
      <X className="h-4 w-4" />
      {pending ? "Cerrando…" : "Cerrar convocatoria"}
    </button>
  );
}

export function EliminarButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Eliminar esta convocatoria? Esta acción no se puede deshacer.")) return;
        startTransition(() => eliminarConvocatoriaAction(id));
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
