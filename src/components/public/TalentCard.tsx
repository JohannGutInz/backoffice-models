import Link from "next/link";
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
