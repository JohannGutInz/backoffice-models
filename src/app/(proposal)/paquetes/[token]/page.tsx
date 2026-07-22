import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getPaquetePublico } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";

export default async function PaquetePublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const paquete = await getPaquetePublico(token);

  if (!paquete) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Branding */}
      <div className="mb-12 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Glamour Models
        </p>
        <div className="h-px flex-1 bg-zinc-100" />
      </div>

      {/* Header del paquete */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-600">
          Propuesta de talento
        </p>
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">{paquete.name}</h1>
        {paquete.description && (
          <p className="mt-2 text-sm text-zinc-500">{paquete.description}</p>
        )}
        <p className="mt-2 text-sm text-zinc-400">
          {paquete.models.length} {paquete.models.length === 1 ? "modelo seleccionado" : "modelos seleccionados"} para
          esta propuesta.
        </p>
      </div>

      {/* Grid de modelos */}
      {paquete.models.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-400">
          Esta propuesta no tiene modelos asignados todavía.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paquete.models.map((modelo) => (
            <Link
              key={modelo.id}
              href={`/talentos/${modelo.id}`}
              className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Foto */}
              <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                {modelo.mainPhotoUrl ? (
                  <img
                    src={modelo.mainPhotoUrl}
                    alt={modelo.fullName}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <Avatar name={modelo.fullName} size="xl" />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-zinc-900 transition-colors group-hover:text-gold-700">{modelo.fullName}</p>
                {modelo.activities.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-gold-700">
                    {modelo.activities.join(" · ")}
                  </p>
                )}
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="h-3 w-3" /> {modelo.location}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {modelo.height && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                      {modelo.height} cm
                    </span>
                  )}
                  {modelo.genre && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                      {modelo.genre}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 border-t border-zinc-100 pt-10 text-center">
        <p className="mb-1 text-sm text-zinc-500">
          ¿Te interesa esta propuesta? Contáctanos para coordinar los detalles.
        </p>
        <Link
          href="/contacto"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-600"
        >
          Contactar a la agencia <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Footer mínimo */}
      <p className="mt-10 text-center text-[11px] text-zinc-300">
        Glamour Models · Propuesta confidencial
      </p>
    </div>
  );
}
