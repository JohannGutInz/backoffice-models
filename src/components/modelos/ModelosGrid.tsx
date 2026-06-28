"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import type { ModelWithRelations } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export function ModelosGrid({ modelos }: { modelos: ModelWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [genero, setGenero] = useState("todos");
  const [categoriaId, setCategoriaId] = useState("todas");

  const todasCategorias = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of modelos) {
      for (const c of m.categories) map.set(c.id, c.name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [modelos]);

  const filtrados = useMemo(() => {
    return modelos.filter((m) => {
      const matchQuery =
        query.trim() === "" ||
        m.fullName.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase());
      const matchGenero = genero === "todos" || m.genre === genero;
      const matchCat =
        categoriaId === "todas" || m.categories.some((c) => c.id === categoriaId);
      return matchQuery && matchGenero && matchCat;
    });
  }, [modelos, query, genero, categoriaId]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <select
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-sm text-zinc-600 outline-none focus:border-gold-500"
        >
          <option value="todos">Todos los géneros</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Femenino</option>
        </select>
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-sm text-zinc-600 outline-none focus:border-gold-500"
        >
          <option value="todas">Todas las categorías</option>
          {todasCategorias.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-zinc-400">
          {filtrados.length} de {modelos.length} modelos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtrados.map((modelo) => (
          <Link
            key={modelo.id}
            href={`${APP_ROUTE.app.modelos.index}/${modelo.id}`}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
              <Avatar name={modelo.fullName} size="xl" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="truncate text-sm font-semibold text-zinc-900">{modelo.fullName}</p>
                  <p className="text-xs text-zinc-400">{formatDate(modelo.birthDate)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {GENRE_LABEL[modelo.genre] ?? modelo.genre}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {modelo.city.name}, {modelo.city.state.name}
                </span>
              </div>
              {modelo.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 border-t border-zinc-100 pt-3">
                  {modelo.categories.map((c) => (
                    <span key={c.id} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">
          Ningún modelo coincide con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
