"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PackageItem } from "@/lib/data";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  CLOSED: "Cerrado",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  SENT: "bg-blue-50 text-blue-700",
  CLOSED: "bg-zinc-200 text-zinc-500",
};

export function PaquetesTable({ packages }: { packages: PackageItem[] }) {
  const [query, setQuery] = useState("");
  const [minModelos, setMinModelos] = useState("");
  const [maxModelos, setMaxModelos] = useState("");
  const [categoryId, setCategoryId] = useState("todas");

  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    for (const pkg of packages) {
      for (const m of pkg.models) {
        for (const c of m.categories) map.set(c.id, c.name);
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [packages]);

  const filtered = useMemo(() => {
    const min = minModelos.trim() === "" ? null : Number(minModelos);
    const max = maxModelos.trim() === "" ? null : Number(maxModelos);

    return packages.filter((pkg) => {
      const matchQuery = query.trim() === "" || pkg.name.toLowerCase().includes(query.toLowerCase());
      const matchMin = min === null || pkg.models.length >= min;
      const matchMax = max === null || pkg.models.length <= max;
      const matchCategory =
        categoryId === "todas" || pkg.models.some((m) => m.categories.some((c) => c.id === categoryId));
      return matchQuery && matchMin && matchMax && matchCategory;
    });
  }, [packages, query, minModelos, maxModelos, categoryId]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 p-5">
        <div className="flex-1 sm:max-w-xs">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre de paquete…"
            icon={<Search />}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={minModelos}
            onChange={(e) => setMinModelos(e.target.value)}
            placeholder="Mín."
            className="w-20 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          <span className="text-sm text-zinc-400">–</span>
          <input
            type="number"
            min={0}
            value={maxModelos}
            onChange={(e) => setMaxModelos(e.target.value)}
            placeholder="Máx."
            className="w-20 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          <span className="text-sm text-zinc-500">modelos</span>
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="text-zinc-600">
          <option value="todas">Todas las categorías</option>
          {allCategories.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <span className="ml-auto text-xs text-zinc-400">
          {filtered.length} de {packages.length} paquetes
        </span>
      </div>

      <Table>
        <THead>
          <Th>Paquete</Th>
          <Th>Modelos</Th>
          <Th>Estado</Th>
          <Th>Creado</Th>
          <Th>{""}</Th>
        </THead>
        <tbody>
          {filtered.map((pkg) => (
            <Tr key={pkg.id}>
              <Td>
                <Link
                  href={`${APP_ROUTE.app.packages.index}/${pkg.id}`}
                  className="font-medium text-zinc-900 hover:text-gold-600"
                >
                  {pkg.name}
                </Link>
                {pkg.description && (
                  <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{pkg.description}</p>
                )}
              </Td>
              <Td>
                <span className="text-sm text-zinc-600">
                  {pkg.models.length} {pkg.models.length === 1 ? "modelo" : "modelos"}
                </span>
              </Td>
              <Td>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[pkg.status] ?? ""}`}>
                  {STATUS_LABEL[pkg.status] ?? pkg.status}
                </span>
              </Td>
              <Td className="text-zinc-500">{formatDate(pkg.createdAt)}</Td>
              <Td>
                <Link
                  href={`${APP_ROUTE.app.packages.index}/${pkg.id}`}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                >
                  Ver
                </Link>
              </Td>
            </Tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-16 text-center text-sm text-zinc-400">
                {packages.length === 0
                  ? "Aún no hay paquetes. Crea el primero con el botón de arriba."
                  : "Ningún paquete coincide con los filtros aplicados."}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
