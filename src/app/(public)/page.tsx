import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TalentCard } from "@/components/public/TalentCard";
import { PresenciaSection } from "@/components/public/PresenciaSection";
import { getConfiguracionSitio } from "@/lib/data";
import { listDestacados, listEventosPortafolio } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [config, destacados, eventos] = await Promise.all([
    getConfiguracionSitio(),
    listDestacados(4),
    listEventosPortafolio(),
  ]);

  return (
    <div>
      <section className="border-b border-zinc-100">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[480px]">
          <Image
            src="/glamour-models.webp"
            alt="Modelos representadas por la agencia"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="bg-zinc-950 px-6 py-16 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-light tracking-tight text-white sm:text-5xl">
            {config.heroTitulo}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400">{config.heroSubtitulo}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/talentos"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-gold-400"
            >
              Ver talentos <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white/10"
            >
              Hablar con la agencia
            </Link>
          </div>
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Talento destacado</h2>
            <Link href="/talentos" className="text-sm font-medium text-gold-700 hover:text-gold-600">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((modelo) => (
              <TalentCard key={modelo.id} modelo={modelo} />
            ))}
          </div>
        </section>
      )}

      {eventos.length > 0 && (
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Trabajo reciente</h2>
              <Link href="/portafolio" className="text-sm font-medium text-gold-700 hover:text-gold-600">
                Ver portafolio →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {eventos.slice(0, 3).map((evento) => (
                <div key={evento.id} className="rounded-xl border border-zinc-200 bg-white p-5">
                  <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">{evento.tipo}</p>
                  <p className="mt-1.5 text-base font-semibold text-zinc-900">{evento.nombre}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {evento.clienteNombre} · {formatDate(evento.fecha)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">¿Buscas talento para tu próxima campaña?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
          Cuéntanos qué necesitas y te ayudamos a armar la propuesta ideal.
        </p>
        <Link
          href="/contacto"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
        >
          Contactar a la agencia <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <PresenciaSection />
    </div>
  );
}
