import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { ModeloPublico } from "@/lib/public-data";

export function TalentCard({ modelo }: { modelo: ModeloPublico }) {
  return (
    <Link
      href={`/talentos/${modelo.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative flex h-64 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
        <Avatar name={modelo.fullName} size="xl" />
        {modelo.destacado && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gold-500/95 px-2 py-1 text-[11px] font-semibold text-zinc-950">
            <Star className="h-3 w-3 fill-current" /> Destacado
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-zinc-900">{modelo.fullName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {modelo.categories.length > 0 ? modelo.categories.join(", ") : modelo.location}
        </p>
      </div>
    </Link>
  );
}
