"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModelPortalNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/app/modelo/perfil", label: "Mi perfil", Icon: User },
    { href: "/app/modelo/convocatorias", label: "Convocatorias", Icon: Bell, badge: unreadCount },
  ];

  return (
    <nav className="border-b border-zinc-200 bg-white px-4 lg:px-8">
      <div className="mx-auto flex max-w-2xl gap-1">
        {tabs.map(({ href, label, Icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2 px-1 py-3.5 text-sm font-medium transition-colors",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-[background]",
                active
                  ? "text-zinc-950 after:bg-gold-500"
                  : "text-zinc-500 hover:text-zinc-700 after:bg-transparent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {badge != null && badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white leading-none">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
