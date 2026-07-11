"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Trash2, UserPlus } from "lucide-react";
import { agregarModeloAPaqueteAction, quitarModeloDelPaqueteAction } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { modelNombreCompleto } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

type Modelo = {
  id: string;
  firstName: string;
  lastNameP: string;
  lastNameM?: string | null;
  artisticName?: string | null;
  categories: { name: string }[];
  city: { name: string };
  country: { name: string };
};

interface Props {
  paqueteId: string;
  modelosEnPaquete: Modelo[];
  todosLosModelos: Modelo[];
}

export function PaqueteModelosManager({ paqueteId, modelosEnPaquete, todosLosModelos }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");

  const idsEnPaquete = new Set(modelosEnPaquete.map((m) => m.id));
  const disponibles = todosLosModelos.filter((m) => !idsEnPaquete.has(m.id));

  async function handleAgregar() {
    if (!selectedId) return;
    setLoading(`add-${selectedId}`);
    await agregarModeloAPaqueteAction(paqueteId, selectedId);
    setSelectedId("");
    setLoading(null);
  }

  async function handleQuitar(modeloId: string) {
    setLoading(`remove-${modeloId}`);
    await quitarModeloDelPaqueteAction(paqueteId, modeloId);
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Agregar modelo */}
      {disponibles.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
          >
            <option value="" disabled>Selecciona un modelo del roster…</option>
            {disponibles.map((m) => (
              <option key={m.id} value={m.id}>
                {modelNombreCompleto(m)}
                {m.categories.length > 0 ? ` — ${m.categories.map((c) => c.name).join(", ")}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedId || loading !== null}
            onClick={handleAgregar}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserPlus className="h-4 w-4" />
            {loading?.startsWith("add") ? "Agregando…" : "Agregar"}
          </button>
        </div>
      )}

      {/* Lista de modelos en el paquete */}
      {modelosEnPaquete.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">
          Este paquete no tiene modelos todavía. Selecciona uno arriba.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {modelosEnPaquete.map((m) => (
            <div key={m.id} className="flex items-center gap-4 py-3">
              <Avatar name={modelNombreCompleto(m)} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900">
                    {modelNombreCompleto(m)}
                    {m.artisticName && (
                      <span className="ml-2 text-xs font-normal text-zinc-400 italic">
                        &ldquo;{m.artisticName}&rdquo;
                      </span>
                    )}
                  </p>
                  <Link
                    href={`${APP_ROUTE.app.modelos.index}/${m.id}`}
                    className="text-zinc-300 hover:text-zinc-600 transition-colors"
                    title="Ver perfil del modelo"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 truncate">
                  {m.categories.map((c) => c.name).join(" · ")}
                  {m.categories.length > 0 && " · "}
                  {m.city.name}, {m.country.name}
                </p>
              </div>
              <button
                type="button"
                disabled={loading === `remove-${m.id}`}
                onClick={() => handleQuitar(m.id)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                title="Quitar del paquete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
