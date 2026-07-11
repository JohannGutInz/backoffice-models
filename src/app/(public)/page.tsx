import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-20">
      {/* Identidad */}
      <div className="mb-16 text-center">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
          Agencia de modelos y edecanes
        </p>
        <h1 className="text-4xl font-light tracking-[0.2em] text-white uppercase sm:text-5xl">
          Glamour Models
        </h1>
        <div className="mx-auto mt-5 h-px w-12 bg-gold-500" />
      </div>

      {/* CTAs */}
      <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
        <Link
          href="/talentos"
          className="group flex flex-1 flex-col items-start justify-between rounded-2xl bg-white px-7 py-6 transition-colors hover:bg-gold-400"
        >
          <span className="mb-6 text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase group-hover:text-zinc-600">
            Organizadores
          </span>
          <div>
            <p className="text-xl font-semibold leading-tight text-zinc-950">
              Quiero contratar
            </p>
            <p className="mt-1 text-sm text-zinc-500 group-hover:text-zinc-600">
              Personal para mi evento
            </p>
          </div>
        </Link>

        <Link
          href="/registro"
          className="group flex flex-1 flex-col items-start justify-between rounded-2xl border border-zinc-700 px-7 py-6 transition-colors hover:border-gold-500 hover:bg-zinc-900"
        >
          <span className="mb-6 text-[10px] font-semibold tracking-[0.2em] text-zinc-600 uppercase group-hover:text-gold-500">
            Talento
          </span>
          <div>
            <p className="text-xl font-semibold leading-tight text-white">
              Busco trabajo
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Quiero unirme al equipo
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
