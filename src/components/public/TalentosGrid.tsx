"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TalentCard } from "./TalentCard";
import { CATEGORIA_LABEL } from "@/lib/labels";
import type { ModeloPublico } from "@/lib/public-data";

export function TalentosGrid({ modelos }: { modelos: ModeloPublico[] }) {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todas");

  const filtrados = useMemo(() => {
    return modelos.filter((m) => {
      const matchQuery = query.trim() === "" || m.nombreArtistico.toLowerCase().includes(query.toLowerCase());
      const matchCategoria = categoria === "todas" || m.categoria === categoria;
      return matchQuery && matchCategoria;
    });
  }, [modelos, query, categoria]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-full border border-zinc-200 bg-white py-2.5 px-4 text-sm text-zinc-600 outline-none focus:border-gold-500"
        >
          <option value="todas">Todas las categorías</option>
          {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-zinc-400">{filtrados.length} talentos</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtrados.map((modelo) => (
          <TalentCard key={modelo.id} modelo={modelo} />
        ))}
      </div>

      {filtrados.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center text-sm text-zinc-400">
          Ningún talento coincide con tu búsqueda.
        </div>
      )}
    </div>
  );
}
