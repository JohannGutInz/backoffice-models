"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TalentCard } from "./TalentCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
        <div className="flex-1 sm:max-w-xs">
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
            className="rounded-full py-2.5 px-4 text-zinc-600"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
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
