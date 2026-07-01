"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { APP_ROUTE } from "@/lib/routes";
import { NAV_GROUPS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggle,
  pendingCount,
}: {
  collapsed: boolean;
  onToggle: () => void;
  pendingCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-900/60 bg-zinc-950 transition-[width] duration-200",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="h-9 w-9 shrink-0 p-0 text-zinc-400 hover:bg-white/5 hover:text-gold-300"
          aria-label="Contraer u expandir menú"
        >
          {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
        </Button>
        {!collapsed && (
          <Link href={APP_ROUTE.app.dashboard.index} className="truncate text-lg leading-none font-semibold text-white">
            Glamour<span className="text-gold-400">Models</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.label ?? idx}>
            {group.label && !collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const showBadge = item.href === APP_ROUTE.app.moderation.index && pendingCount > 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-white/[0.08] text-gold-300"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                        collapsed && "justify-center",
                      )}
                    >
                      {active && (
                        <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold-400" />
                      )}
                      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && showBadge && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-zinc-950">
                          {pendingCount}
                        </span>
                      )}
                      {collapsed && showBadge && (
                        <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-gold-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/5 p-4 text-[11px] text-zinc-500">
          <p>GlamourModels · v1</p>
          <p className="mt-0.5">Backoffice interno — no indexado</p>
        </div>
      )}
    </aside>
  );
}
