"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { UsuarioStaff } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({
  usuario,
  pendingCount,
  children,
}: {
  usuario: UsuarioStaff;
  pendingCount: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} pendingCount={pendingCount} />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "pl-20" : "pl-64")}>
        <Topbar usuario={usuario} notificationCount={pendingCount} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
