"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/talentos", label: "Talentos" },
  { href: "/portafolio", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicHeader({
  agencyName,
  publicRegistrationActive,
}: {
  agencyName: string;
  publicRegistrationActive: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-zinc-200/60 bg-white/95 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-950">
          {agencyName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative pb-0.5 font-semibold transition-colors duration-200",
                  "after:absolute after:bottom-0 after:left-0 after:h-px after:transition-[width] after:duration-200",
                  transparent
                    ? [
                        isActive ? "text-white" : "text-white/80",
                        "hover:text-gold-400",
                        isActive ? "after:w-full after:bg-gold-400" : "after:w-0 after:bg-gold-400",
                      ]
                    : [
                        isActive ? "text-zinc-950" : "text-zinc-500",
                        "hover:text-gold-500",
                        isActive ? "after:w-full after:bg-gold-500" : "after:w-0 after:bg-gold-500",
                      ],
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        {publicRegistrationActive ? (
          <Link
            href={APP_ROUTE.registration.index}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Quiero ser parte
          </Link>
        ) : (
          <Link href={APP_ROUTE.contact.index} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            Contacto
          </Link>
        )}
      </div>
    </header>
  );
}
