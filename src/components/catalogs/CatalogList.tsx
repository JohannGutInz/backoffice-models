"use client";

import { useTransition } from "react";
import { toggleCategoryEnabledAction } from "@/lib/actions";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";

type Category = { id: string; name: string; enabled: boolean };

export function CatalogList({ categories }: { categories: Category[] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Catálogos registrados</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{categories.length} en total</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-zinc-400">No hay catálogos aún. Crea el primero.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 pb-2">
          {categories.map((cat) => (
            <CatalogRow key={cat.id} category={cat} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function CatalogRow({ category }: { category: Category }) {
  const [, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleCategoryEnabledAction(category.id, !category.enabled);
    });
  }

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          category.enabled ? "bg-zinc-100 text-zinc-500" : "bg-zinc-50 text-zinc-300"
        }`}
      >
        {category.name[0].toUpperCase()}
      </span>
      <span className={`flex-1 text-sm ${category.enabled ? "text-zinc-800" : "text-zinc-400 line-through"}`}>
        {category.name}
      </span>
      <Switch
        checked={category.enabled}
        onChange={handleToggle}
        size="sm"
        aria-label={category.enabled ? "Deshabilitar" : "Habilitar"}
      />
    </li>
  );
}
