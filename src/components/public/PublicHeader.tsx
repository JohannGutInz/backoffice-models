"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/talentos", label: "Talentos" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/contacto", label: "Contacto" },
];

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.53V6.76a4.85 4.85 0 0 1-1.02-.07z" />
    </svg>
  );
}

const SOCIAL = [
  { href: "https://www.facebook.com/somosglamourmodels/", label: "Facebook", Icon: IconFacebook },
  { href: "https://www.instagram.com/somosglamourmodels/", label: "Instagram", Icon: IconInstagram },
  { href: "https://www.tiktok.com/@somosglamourmodels", label: "TikTok", Icon: IconTikTok },
];

export function PublicHeader({
  agencyName,
  publicRegistrationActive: _publicRegistrationActive,
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
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "text-lg font-semibold tracking-tight transition-colors duration-300",
            transparent ? "text-white" : "text-zinc-950",
          )}
        >
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

        {/* Redes sociales */}
        <div className="flex items-center gap-4">
          {SOCIAL.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={cn(
                "transition-colors duration-200",
                transparent ? "text-white/70 hover:text-gold-400" : "text-zinc-400 hover:text-gold-500",
              )}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
