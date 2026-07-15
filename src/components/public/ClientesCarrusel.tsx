"use client";

const CLIENTES = [
  "Prada", "Nissan", "Armani", "Liverpool", "Nike",
  "Samsung", "Corona", "BBVA", "Telcel", "Cinépolis",
  "Bimbo", "Coca-Cola", "Elektra", "Palacio de Hierro", "Heineken",
];

function LogoItem({ name }: { name: string }) {
  return (
    <span className="inline-flex shrink-0 items-center px-8 text-sm font-semibold tracking-[0.2em] text-gold-500/80 uppercase select-none">
      {name}
      <span className="ml-8 h-px w-4 bg-gold-500/30" />
    </span>
  );
}

export function ClientesCarrusel() {
  const items = [...CLIENTES, ...CLIENTES];

  return (
    <section className="overflow-hidden bg-zinc-950 py-16">
      <div className="mx-auto mb-10 max-w-6xl px-6">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
          Clientes
        </p>
        <h2 className="text-3xl font-light tracking-tight text-white">
          Marcas que confían en nosotros
        </h2>
      </div>

      {/* Fila 1 — izquierda a derecha */}
      <div className="relative flex overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {items.map((name, i) => <LogoItem key={`a-${i}`} name={name} />)}
        </div>
        <div aria-hidden className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {items.map((name, i) => <LogoItem key={`b-${i}`} name={name} />)}
        </div>
      </div>

      {/* Fila 2 — derecha a izquierda */}
      <div className="relative mt-4 flex overflow-hidden">
        <div className="flex animate-[marquee-reverse_25s_linear_infinite] whitespace-nowrap">
          {[...items].reverse().map((name, i) => <LogoItem key={`c-${i}`} name={name} />)}
        </div>
        <div aria-hidden className="flex animate-[marquee-reverse_25s_linear_infinite] whitespace-nowrap">
          {[...items].reverse().map((name, i) => <LogoItem key={`d-${i}`} name={name} />)}
        </div>
      </div>
    </section>
  );
}
