"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, Star } from "lucide-react";
import type { Modelo } from "@/lib/types";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { EstadoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

export function ModelosGrid({ modelos }: { modelos: Modelo[] }) {
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [estado, setEstado] = useState("todos");

  const filtrados = useMemo(() => {
    return modelos.filter((m) => {
      const matchQuery =
        query.trim() === "" ||
        m.nombreArtistico.toLowerCase().includes(query.toLowerCase()) ||
        m.numeroModelo.toLowerCase().includes(query.toLowerCase());
      const matchCategoria = categoria === "todas" || m.categoria === categoria;
      const matchEstado = estado === "todos" || m.estado === estado;
      return matchQuery && matchCategoria && matchEstado;
    });
  }, [modelos, query, categoria, estado]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o número…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-sm text-zinc-600 outline-none focus:border-gold-500"
        >
          <option value="todas">Todas las categorías</option>
          {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white py-2.5 px-3 text-sm text-zinc-600 outline-none focus:border-gold-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="borrador">Borrador</option>
          <option value="inactivo">Inactivo</option>
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
              <Avatar name={modelo.nombreArtistico} size="xl" />
              {modelo.destacado && (
                <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gold-500/95 px-2 py-1 text-[11px] font-semibold text-zinc-950">
                  <Star className="h-3 w-3 fill-current" /> Destacado
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="truncate text-sm font-semibold text-zinc-900">{modelo.nombreArtistico}</p>
                  <p className="text-xs text-zinc-400">{modelo.numeroModelo}</p>
                </div>
                <EstadoBadge estado={modelo.estado} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {modelo.contacto.ubicacion}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600">
                  {CATEGORIA_LABEL[modelo.categoria]}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                <span className="text-xs text-zinc-400">Tarifa base</span>
                <span className="text-sm font-semibold text-zinc-900">{formatCurrency(modelo.tarifaBase)}</span>
              </div>
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
