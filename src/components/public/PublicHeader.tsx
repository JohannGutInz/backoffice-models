import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_ROUTE } from "@/lib/routes";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/talentos", label: "Talentos" },
  { href: "/portafolio", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicHeader({
  nombreAgencia,
  registroPublicoActivo,
}: {
  nombreAgencia: string;
  registroPublicoActivo: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-950">
          {nombreAgencia}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-zinc-950">
              {link.label}
            </Link>
          ))}
        </nav>
        {registroPublicoActivo ? (
          <Link
            href={APP_ROUTE.registros.index}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Quiero ser parte <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link href={APP_ROUTE.contacto.index} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            Contacto
          </Link>
        )}
      </div>
    </header>
  );
}
