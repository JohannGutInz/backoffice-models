"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/talentos", label: "Talentos" },
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/contacto", label: "Contacto" },
];

const ABOUT_LINKS = [
  { href: "/servicios", label: "Servicios" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/como-trabajamos", label: "¿Cómo trabajamos?" },
  { href: "/razones", label: "¿Por qué elegirnos?" },
  { href: "/mision-vision", label: "Misión y visión" },
  { href: "/historia", label: "Historia" },
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
  publicRegistrationActive,
}: {
  publicRegistrationActive: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAboutActive = ABOUT_LINKS.some((link) => pathname.startsWith(link.href));

  // Close mobile menu on route change (adjust state during render, not in an effect)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setAboutOpen(false);
  }

  useEffect(() => {
    if (!aboutOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) setAboutOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAboutOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [aboutOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const registrationLink = publicRegistrationActive
    ? { href: "/registro", label: "Únete" }
    : null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300",
          scrolled ? "border-white/10 bg-black/70" : "border-white/5 bg-black/40",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-200",
                    isActive
                      ? "bg-gold-500/20 text-gold-300 ring-1 ring-inset ring-gold-500/40"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* "Conócenos" — secondary dropdown, kept visually quiet next to the main nav */}
            <div ref={aboutRef} className="relative">
              <button
                type="button"
                onClick={() => setAboutOpen((o) => !o)}
                aria-expanded={aboutOpen}
                aria-haspopup="menu"
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] uppercase transition-colors duration-200",
                  isAboutActive ? "text-gold-300" : "text-white/50 hover:text-white/85",
                )}
              >
                Conócenos
                <ChevronDown className={cn("h-3 w-3 transition-transform", aboutOpen && "rotate-180")} />
              </button>

              {aboutOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+10px)] left-1/2 flex w-56 -translate-x-1/2 flex-col gap-0.5 rounded-2xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl"
                >
                  {ABOUT_LINKS.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        onClick={() => setAboutOpen(false)}
                        className={cn(
                          "rounded-lg px-3.5 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase transition-colors",
                          isActive ? "bg-gold-500/15 text-gold-300" : "text-white/70 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {registrationLink && (
              <Link
                href={registrationLink.href}
                className="rounded-full border border-gold-500/70 bg-gold-500/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-gold-300 uppercase transition-colors hover:bg-gold-500 hover:text-white"
              >
                {registrationLink.label}
              </Link>
            )}
          </nav>

          {/* Desktop social + mobile hamburger */}
          <div className="flex items-center gap-4">
            {/* Social links — desktop only */}
            <div className="hidden items-center gap-3 md:flex">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:text-gold-400"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-30 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <nav
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 flex-col border-l border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-end border-b border-white/10 px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm font-semibold tracking-wide uppercase transition-colors",
                    isActive
                      ? "bg-gold-500/15 text-gold-300"
                      : "text-white/75 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {registrationLink && (
              <Link
                href={registrationLink.href}
                className="mt-2 flex items-center justify-center rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-gold-600"
              >
                {registrationLink.label}
              </Link>
            )}

            {/* Conócenos — secondary group, quieter styling */}
            <p className="mt-6 mb-1 px-4 text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
              Conócenos
            </p>
            {ABOUT_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-2.5 text-[13px] font-medium tracking-wide uppercase transition-colors",
                    isActive ? "bg-gold-500/15 text-gold-300" : "text-white/55 hover:bg-white/5 hover:text-white/85",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Social at bottom of drawer */}
          <div className="border-t border-white/10 px-6 py-5">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Síguenos</p>
            <div className="flex items-center gap-5">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/60 transition-colors hover:text-gold-400"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
