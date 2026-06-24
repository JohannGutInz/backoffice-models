import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  href: string;
}

export function QuickActions({ items }: { items: QuickAction[] }) {
  return (
    <Card>
      <CardHeader title="Acciones rápidas" />
      <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="flex-1 text-sm font-medium text-zinc-800">{item.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
