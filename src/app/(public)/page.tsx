import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TalentCard } from "@/components/public/TalentCard";
import { PresenceSection } from "@/components/public/PresenceSection";
import { getSiteSettings } from "@/lib/data";
import { listFeaturedModels, listPortfolioEvents } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [config, featuredModels, events] = await Promise.all([
    getSiteSettings(),
    listFeaturedModels(4),
    listPortfolioEvents(),
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
            {config.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400">{config.heroSubtitle}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/talentos"
              className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-7 py-8 backdrop-blur-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-500"
            >
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase transition-colors duration-200 group-hover:text-gold-400">
                Organizadores
              </span>
              <p className="text-base text-zinc-400">
                Quiero contratar personal
              </p>
            </Link>

            <Link
              href="/registro"
              className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-7 py-8 backdrop-blur-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-500"
            >
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase transition-colors duration-200 group-hover:text-gold-400">
                Talento
              </span>
              <p className="text-base text-zinc-400">
                Quiero unirme al equipo
              </p>
            </Link>
          </div>
        </div>

        {/* Scroll arrow — solo si hay portafolio */}
        {portafolio.length > 0 && (
          <a
            href="#portafolio"
            className="absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-zinc-400 transition-colors hover:border-gold-500 hover:text-gold-400"
          >
            <ArrowDown className="h-5 w-5" />
          </a>
        )}
      </section>

      {featuredModels.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Talento destacado</h2>
            <Link href="/talentos" className="text-sm font-medium text-gold-700 hover:text-gold-600">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredModels.map((model) => (
              <TalentCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="border-t border-zinc-100 bg-zinc-50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Trabajo reciente</h2>
              <Link href="/portafolio" className="text-sm font-medium text-gold-700 hover:text-gold-600">
                Ver portafolio →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-xl border border-zinc-200 bg-white p-5">
                  <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">{event.type}</p>
                  <p className="mt-1.5 text-base font-semibold text-zinc-900">{event.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {event.clientName} · {formatDate(event.date)}
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

      <PresenceSection />
    </div>
  );
}
