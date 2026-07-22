import Link from "next/link";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { listPublicConvocatorias } from "@/lib/public-data";
import { APP_ROUTE } from "@/lib/routes";

export default async function ConvocatoriasPublicasPage() {
  const convocatorias = await listPublicConvocatorias();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Convocatorias</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Oportunidades de trabajo disponibles para talento registrado en la agencia.
        </p>
      </div>

      {convocatorias.length === 0 ? (
        <p className="text-sm text-zinc-400">No hay convocatorias activas en este momento. Vuelve pronto.</p>
      ) : (
        <ul className="space-y-4">
          {convocatorias.map((c) => (
            <li key={c.id}>
              <Link
                href={APP_ROUTE.convocatorias.detail(c.id)}
                className="group flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {c.tipo}
                    </span>
                  </div>
                  <p className="font-medium text-zinc-900 group-hover:text-gold-600 truncate">{c.titulo}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {c.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {c.ciudad}
                    </span>
                    <span className="font-medium text-zinc-500">{c.pago}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 group-hover:text-zinc-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
