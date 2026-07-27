"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { renombrarPaqueteAction } from "@/lib/actions";

export function PaqueteNameEditor({ paqueteId, name }: { paqueteId: string; name: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function startEditing() {
    setValue(name);
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setError(null);
    setValue(name);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    const result = await renombrarPaqueteAction(paqueteId, { name: value.trim() });
    setIsSaving(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{name}</h1>
        <button
          type="button"
          onClick={startEditing}
          title="Editar nombre del paquete"
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") cancelEditing();
          }}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-lg font-semibold text-zinc-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          title="Guardar"
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={cancelEditing}
          disabled={isSaving}
          title="Cancelar"
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
