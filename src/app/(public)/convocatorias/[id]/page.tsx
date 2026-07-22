import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, MessageCircle, ChevronLeft } from "lucide-react";
import { getPublicConvocatoria } from "@/lib/public-data";
import { APP_ROUTE } from "@/lib/routes";

export default async function ConvocatoriaPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getPublicConvocatoria(id);
  if (!conv) notFound();

  const waLink = `https://wa.me/${conv.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa la convocatoria: ${conv.titulo}`)}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href={APP_ROUTE.convocatorias.index}
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600"
      >
        <ChevronLeft className="h-4 w-4" /> Todas las convocatorias
      </Link>

      <div className="mb-2">
        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {conv.tipo}
        </span>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-950">{conv.titulo}</h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {conv.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {conv.horario}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {conv.lugar}, {conv.ciudad}
        </span>
      </div>

      <div className="mt-8 space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Funciones</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{conv.funciones}</p>
        </section>

        <hr className="border-zinc-100" />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Perfil requerido</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{conv.perfil}</p>
        </section>

        <hr className="border-zinc-100" />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pago</h2>
          <p className="mt-2 text-sm font-medium text-zinc-900">{conv.pago}</p>
        </section>

        {conv.cuerpo && (
          <>
            <hr className="border-zinc-100" />
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Información adicional</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{conv.cuerpo}</p>
            </section>
          </>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm text-zinc-600">
          Si te interesa esta convocatoria, escríbenos por WhatsApp para confirmar tu participación o resolver dudas.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1ebe5d]"
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
