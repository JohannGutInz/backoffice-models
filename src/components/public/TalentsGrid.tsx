"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TalentCard } from "./TalentCard";
import type { PublicModel } from "@/lib/public-data";

export function TalentsGrid({ models }: { models: PublicModel[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");

  const categories = useMemo(() => {
    const all = models.flatMap((m) => m.categories);
    return [...new Set(all)].sort();
  }, [models]);

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchQuery =
        query.trim() === "" || m.fullName.toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === "todas" || m.categories.includes(category);
      return matchQuery && matchCategory;
    });
  }, [models, query, category]);

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
        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-zinc-200 bg-white py-2.5 px-4 text-sm text-zinc-600 outline-none focus:border-gold-500"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto text-xs text-zinc-400">{filtered.length} talentos</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((model) => (
          <TalentCard key={model.id} model={model} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center text-sm text-zinc-400">
          Ningún talento coincide con tu búsqueda.
        </div>
      )}
    </div>
  );
}
