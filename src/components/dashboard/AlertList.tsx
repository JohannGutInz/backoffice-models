import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";

export interface AlertItem {
  icon: LucideIcon;
  tone: "rose" | "amber" | "sky";
  title: string;
  subtitle: string;
  href: string;
}

const toneClasses: Record<AlertItem["tone"], string> = {
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
};

export function AlertList({ items }: { items: AlertItem[] }) {
  return (
    <Card>
      <CardHeader title="Alertas" />
      <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[item.tone]}`}>
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-800">{item.title}</span>
                <span className="block truncate text-xs text-zinc-500">{item.subtitle}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-5 py-6 text-center text-sm text-zinc-400">Todo en orden — sin pendientes.</li>
        )}
      </ul>
    </Card>
  );
}
