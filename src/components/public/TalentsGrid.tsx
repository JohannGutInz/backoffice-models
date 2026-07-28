"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TalentCard } from "./TalentCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { PublicModel } from "@/lib/public-data";
import { formatFullName } from "@/lib/utils";

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
        query.trim() === "" || formatFullName(m).toLowerCase().includes(query.toLowerCase());
      const matchCategory = category === "todas" || m.categories.includes(category);
      return matchQuery && matchCategory;
    });
  }, [models, query, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-xs sm:flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            icon={<Search />}
            className="rounded-full"
          />
        </div>
        {categories.length > 0 && (
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-full py-2.5 px-4 text-zinc-600 sm:w-auto"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
        <span className="text-xs font-medium text-zinc-500 sm:ml-auto sm:shrink-0">
          {filtered.length} {filtered.length === 1 ? "talento" : "talentos"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {filtered.map((model) => (
          <TalentCard key={model.id} model={model} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-24 text-center">
          <p className="text-base font-medium text-zinc-600">Sin resultados</p>
          <p className="mt-1 text-sm text-zinc-400">
            Ningún talento coincide con tu búsqueda. Prueba con otros filtros.
          </p>
        </div>
      )}
    </div>
  );
}
