"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import type { ModelWithRelations } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export function ModelsGrid({ models }: { models: ModelWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("todos");
  const [categoryId, setCategoryId] = useState("todas");

  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of models) {
      for (const c of m.categories) map.set(c.id, c.name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [models]);

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchQuery =
        query.trim() === "" ||
        m.fullName.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase());
      const matchGender = gender === "todos" || m.genre === gender;
      const matchCategory =
        categoryId === "todas" || m.categories.some((c) => c.id === categoryId);
      return matchQuery && matchGender && matchCategory;
    });
  }, [models, query, gender, categoryId]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex-1 sm:max-w-xs">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            icon={<Search />}
          />
        </div>
        <Select value={gender} onChange={(e) => setGender(e.target.value)} className="text-zinc-600">
          <option value="todos">Todos los géneros</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Femenino</option>
        </Select>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="text-zinc-600">
          <option value="todas">Todas las categorías</option>
          {allCategories.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <span className="ml-auto text-xs text-zinc-400">
          {filtered.length} de {models.length} modelos
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((model) => (
          <Link
            key={model.id}
            href={`${APP_ROUTE.app.models.index}/${model.id}`}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
              <Avatar name={model.fullName} size="xl" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="truncate text-sm font-semibold text-zinc-900">{model.fullName}</p>
                  <p className="text-xs text-zinc-400">{formatDate(model.birthDate)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {GENRE_LABEL[model.genre] ?? model.genre}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {model.city.name}, {model.city.state.name}
                </span>
              </div>
              {model.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 border-t border-zinc-100 pt-3">
                  {model.categories.map((c) => (
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

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">
          Ningún modelo coincide con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
