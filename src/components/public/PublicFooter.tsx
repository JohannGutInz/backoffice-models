import Link from "next/link";

export function PublicFooter({ agencyName }: { agencyName: string }) {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-semibold text-white">{agencyName}</p>
          <p className="mt-1 text-sm text-zinc-500">Representación de talento y modelos.</p>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/talentos" className="hover:text-white">
            Talentos
          </Link>
          <Link href="/portafolio" className="hover:text-white">
            Eventos
          </Link>
          <Link href="/contacto" className="hover:text-white">
            Contacto
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl border-t border-white/5 px-6 py-5 text-xs text-zinc-500">
        © {new Date().getFullYear()} {agencyName}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
