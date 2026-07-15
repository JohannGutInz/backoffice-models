import Link from "next/link";

export function PublicFooter({ nombreAgencia }: { nombreAgencia: string }) {
  return (
    <footer className="border-t border-zinc-200/60 bg-white/95 text-zinc-500">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-6 py-4">
        {/* Marca */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-zinc-950">{nombreAgencia}</span>
          <span className="hidden text-zinc-300 sm:inline">·</span>
          <span className="hidden text-sm sm:inline">Representación de talento y modelos.</span>
        </div>

        {/* Links de empresa */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium">
          <Link href="/historia" className="transition-colors duration-200 hover:text-gold-500">
            Historia
          </Link>
          <Link href="/privacidad" className="transition-colors duration-200 hover:text-gold-500">
            Aviso de privacidad
          </Link>
          <a
            href="https://jpablocruzg.jimdosite.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-gold-500"
          >
            Conoce a nuestro director
          </a>
        </nav>

        {/* Links de nav */}
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/talentos" className="transition-colors duration-200 hover:text-gold-500">Talentos</Link>
          <Link href="/portafolio" className="transition-colors duration-200 hover:text-gold-500">Eventos</Link>
          <Link href="/contacto" className="transition-colors duration-200 hover:text-gold-500">Contacto</Link>
        </nav>
      </div>

      <div className="border-t border-zinc-200/60 px-6 py-2.5">
        <p className="text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} {nombreAgencia}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
