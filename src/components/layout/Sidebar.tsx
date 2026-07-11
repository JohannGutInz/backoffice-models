"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react";
import { APP_ROUTE } from "@/lib/routes";
import { NAV_GROUPS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const LS_KEY = "nav-collapsed-groups";

function readCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(groups: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...groups]));
  } catch {}
}

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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(readCollapsed);

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      saveCollapsed(next);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-900/60 bg-zinc-950 transition-[width] duration-200",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo / toggle */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4">
        <button
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-gold-300"
          aria-label="Contraer u expandir menú"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
        {!collapsed && (
          <Link
            href={APP_ROUTE.app.dashboard.index}
            className="truncate text-lg font-semibold leading-none text-white"
          >
            Glamour<span className="text-gold-400">Models</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group, idx) => {
          const isGroupCollapsed = !collapsed && !!group.label && collapsedGroups.has(group.label);

          return (
            <div key={group.label ?? idx}>
              {/* Section header */}
              {group.label && !collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label!)}
                  className="mb-1 flex w-full items-center justify-between rounded px-3 py-1 text-left transition-colors hover:bg-white/5"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-zinc-600 transition-transform duration-200",
                      isGroupCollapsed && "-rotate-90",
                    )}
                  />
                </button>
              )}

              {/* Items — hidden when section is manually collapsed (only in expanded sidebar mode) */}
              {!isGroupCollapsed && (
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href || pathname?.startsWith(item.href + "/");
                    const showBadge =
                      item.href === APP_ROUTE.app.moderacion.index && pendingCount > 0;
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
                            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold-400" />
                          )}
                          <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                          {!collapsed && showBadge && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-zinc-950">
                              {pendingCount}
                            </span>
                          )}
                          {collapsed && showBadge && (
                            <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-gold-400" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
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
