"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { logoutAction } from "@/lib/actions";
import type { UsuarioStaff } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  admin: "admin",
  booker: "booker",
  moderador: "moderador",
  finanzas: "finanzas",
};

export function Topbar({
  usuario,
  notificationCount,
}: {
  usuario: UsuarioStaff;
  notificationCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6 lg:px-8">
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
        aria-label="Notificaciones"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-white" />
        )}
      </button>

      <div className="h-6 w-px bg-zinc-200" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-zinc-100"
        >
          <Avatar name={usuario.nombre} size="md" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-zinc-900">{usuario.nombre}</span>
            <span className="block text-xs text-zinc-500">{ROLE_LABEL[usuario.rol] ?? usuario.rol}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg">
              <Link
                href="/configuracion"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound className="h-4 w-4" /> Mi perfil
              </Link>
              <Link
                href="/configuracion"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4" /> Configuración
              </Link>
              <div className="my-1 h-px bg-zinc-100" />
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
