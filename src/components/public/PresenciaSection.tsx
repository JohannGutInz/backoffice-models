import { MAPA_COLOMBIA, MAPA_MEXICO, type MapaPais } from "@/lib/mapa-geo";

function MiniMapa({ pais, maxWidth }: { pais: MapaPais; maxWidth: string }) {
  return (
    <svg
      viewBox={`0 0 ${pais.width} ${pais.height}`}
      className="h-auto w-full"
      style={{ maxWidth }}
      role="img"
      aria-label="Mapa de presencia"
    >
      {pais.states.map((estado) => (
        <path
          key={estado.name}
          d={estado.d}
          strokeWidth={1}
          className={estado.presente ? "fill-gold-500 stroke-zinc-950" : "fill-zinc-800 stroke-zinc-700"}
        >
          <title>{estado.presente ? `${estado.name}: ${estado.cities.join(", ")}` : estado.name}</title>
        </path>
      ))}
    </svg>
  );
}

export function PresenciaSection() {
  return (
    <section className="border-t border-white/10 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-white">
          Contamos con presencia en
        </h2>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 sm:grid-cols-3">
          <div className="flex flex-col items-center sm:col-span-2">
            <MiniMapa pais={MAPA_MEXICO} maxWidth="520px" />
            <p className="mt-4 text-sm font-medium text-white">🇲🇽 México</p>
          </div>
          <div className="flex flex-col items-center sm:col-span-1">
            <MiniMapa pais={MAPA_COLOMBIA} maxWidth="220px" />
            <p className="mt-4 text-sm font-medium text-white">
              🇨🇴 Colombia <span className="text-zinc-500">— Valle de Aburrá, Antioquia</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
