"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Trash2, UserPlus, SlidersHorizontal } from "lucide-react";
import { agregarModeloAPaqueteAction, quitarModeloDelPaqueteAction } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { formatFullName } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

type Modelo = {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  genre: string;
  categories: { name: string }[];
  city: { name: string };
  country: { name: string };
};

interface Props {
  paqueteId: string;
  modelosEnPaquete: Modelo[];
  todosLosModelos: Modelo[];
}

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

const SELECT =
  "rounded-lg border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-700 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500";

export function PaqueteModelosManager({ paqueteId, modelosEnPaquete, todosLosModelos }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterPais, setFilterPais] = useState("");

  const idsEnPaquete = new Set(modelosEnPaquete.map((m) => m.id));
  const disponibles = todosLosModelos.filter((m) => !idsEnPaquete.has(m.id));

  // Derive unique filter options from full roster (not just disponibles)
  const categorias = useMemo(() => {
    const set = new Set<string>();
    todosLosModelos.forEach((m) => m.categories.forEach((c) => set.add(c.name)));
    return Array.from(set).sort();
  }, [todosLosModelos]);

  const paises = useMemo(() => {
    const set = new Set<string>();
    todosLosModelos.forEach((m) => set.add(m.country.name));
    return Array.from(set).sort();
  }, [todosLosModelos]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    todosLosModelos.forEach((m) => set.add(m.genre));
    return Array.from(set).sort();
  }, [todosLosModelos]);

  const filtrados = useMemo(() => {
    return disponibles.filter((m) => {
      if (filterCategoria && !m.categories.some((c) => c.name === filterCategoria)) return false;
      if (filterGenre && m.genre !== filterGenre) return false;
      if (filterPais && m.country.name !== filterPais) return false;
      return true;
    });
  }, [disponibles, filterCategoria, filterGenre, filterPais]);

  const hasFilters = filterCategoria !== "" || filterGenre !== "" || filterPais !== "";

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
    <div className="space-y-5">
      {/* Filtros + selector */}
      {disponibles.length > 0 && (
        <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
          {/* Fila de filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Filtrar:</span>

            {categorias.length > 0 && (
              <select
                value={filterCategoria}
                onChange={(e) => { setFilterCategoria(e.target.value); setSelectedId(""); }}
                className={SELECT}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {genres.length > 1 && (
              <select
                value={filterGenre}
                onChange={(e) => { setFilterGenre(e.target.value); setSelectedId(""); }}
                className={SELECT}
              >
                <option value="">Todos los sexos</option>
                {genres.map((g) => (
                  <option key={g} value={g}>{GENRE_LABEL[g] ?? g}</option>
                ))}
              </select>
            )}

            {paises.length > 1 && (
              <select
                value={filterPais}
                onChange={(e) => { setFilterPais(e.target.value); setSelectedId(""); }}
                className={SELECT}
              >
                <option value="">Todos los países</option>
                {paises.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            {hasFilters && (
              <button
                type="button"
                onClick={() => { setFilterCategoria(""); setFilterGenre(""); setFilterPais(""); setSelectedId(""); }}
                className="text-xs text-zinc-400 underline hover:text-zinc-600"
              >
                Limpiar
              </button>
            )}

            <span className="ml-auto text-xs text-zinc-400">
              {filtrados.length} {filtrados.length === 1 ? "modelo" : "modelos"}
            </span>
          </div>

          {/* Selector de modelo */}
          {filtrados.length > 0 ? (
            <div className="flex gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
              >
                <option value="" disabled>Selecciona un modelo del roster…</option>
                {filtrados.map((m) => (
                  <option key={m.id} value={m.id}>
                    {formatFullName(m)}
                    {m.categories.length > 0 ? ` — ${m.categories.map((c) => c.name).join(", ")}` : ""}
                    {` · ${m.country.name}`}
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
          ) : (
            <p className="text-sm text-zinc-400">
              {hasFilters
                ? "Ningún modelo disponible con estos filtros."
                : "Todos los modelos ya están en el paquete."}
            </p>
          )}
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
              <Avatar name={formatFullName(m)} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900">{formatFullName(m)}</p>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {GENRE_LABEL[m.genre] ?? m.genre}
                  </span>
                  <Link
                    href={`${APP_ROUTE.app.models.index}/${m.id}`}
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
