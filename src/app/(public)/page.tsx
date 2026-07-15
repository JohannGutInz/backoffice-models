import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { ClientesCarrusel } from "@/components/public/ClientesCarrusel";

export default async function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative -mt-16 flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20">
        {/* Video de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/video/video-banner2.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-zinc-950/60" />

        {/* Degradado inferior */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.3em] text-zinc-400 uppercase">
              Agencia de modelos y edecanes
            </p>
            <h1 className="text-4xl font-light tracking-[0.2em] text-white uppercase sm:text-5xl">
              Glamour Models
            </h1>
            <div className="mx-auto mt-5 h-px w-12 bg-gold-500" />
          </div>

          <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
            <Link
              href="/talentos"
              className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-7 py-8 backdrop-blur-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-500"
            >
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase transition-colors duration-200 group-hover:text-gold-400">
                Contratar talento
              </span>
              <p className="text-base text-zinc-400">
                Quiero contratar personal para mi evento
              </p>
            </Link>

            <Link
              href="/registro"
              className="group flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-7 py-8 backdrop-blur-sm transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold-500"
            >
              <span className="text-sm font-bold tracking-[0.25em] text-white uppercase transition-colors duration-200 group-hover:text-gold-400">
                Ser talento
              </span>
              <p className="text-base text-zinc-400">
                Quiero unirme al equipo
              </p>
            </Link>
          </div>
        </div>

        {/* Scroll arrow */}
        <a
          href="#clientes"
          className="absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-zinc-400 transition-colors hover:border-gold-500 hover:text-gold-400"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      {/* ── Clientes ── */}
      <div id="clientes" className="scroll-mt-16">
        <ClientesCarrusel />
      </div>
    </div>
  );
}
