import Link from "next/link";
import { Calendar, Clock, MapPin, MessageCircle } from "lucide-react";
import { MarcarVistas } from "@/components/convocatorias/MarcarVistas";
import { listPublicConvocatorias } from "@/lib/public-data";
import { APP_ROUTE } from "@/lib/routes";

export default async function ModelConvocatoriasPage() {
  const convocatorias = await listPublicConvocatorias();

  return (
    <>
      {/* Marks all OPEN convocatorias as seen on mount */}
      <MarcarVistas />

      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-950">Convocatorias disponibles</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Oportunidades de trabajo activas. Escríbenos por WhatsApp para confirmar tu interés.
          </p>
        </div>

        {convocatorias.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">No hay convocatorias activas en este momento.</p>
            <p className="mt-1 text-xs text-zinc-300">Recibirás una notificación cuando haya nuevas oportunidades.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {convocatorias.map((c) => {
              const waLink = `https://wa.me/${c.whatsappNumber?.replace(/\D/g, "") ?? ""}?text=${encodeURIComponent(`Hola, me interesa la convocatoria: ${c.titulo}`)}`;
              return (
                <li key={c.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {c.tipo}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500">{c.pago}</span>
                    </div>

                    <h2 className="font-semibold text-zinc-900">{c.titulo}</h2>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {c.fechaEvento.toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {c.horario}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {c.lugar}, {c.ciudad}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
                    <Link
                      href={APP_ROUTE.convocatorias.detail(c.id)}
                      target="_blank"
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Ver detalles
                    </Link>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1ebe5d]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Confirmar interés
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
