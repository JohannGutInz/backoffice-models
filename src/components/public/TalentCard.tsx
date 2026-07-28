import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PublicModel } from "@/lib/public-data";
import { formatFullName } from "@/lib/utils";

export function TalentCard({ model }: { model: PublicModel }) {
  const name = formatFullName(model);

  return (
    <Link
      href={`/talentos/${model.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {model.mainPhotoUrl ? (
          <Image
            src={model.mainPhotoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
            <Avatar name={name} size="xl" />
          </div>
        )}

        {/* Featured badge */}
        {model.featured && (
          <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-gold-500/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-950 shadow">
            <Star className="h-3 w-3 fill-current" /> Destacado
          </span>
        )}

        {/* Hover overlay — gradient with name + categories */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-base font-semibold leading-tight text-white">{name}</p>
          {model.categories.length > 0 && (
            <p className="mt-1 text-xs text-gold-300">
              {model.categories.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="truncate text-xs font-semibold text-zinc-900 sm:text-sm">{name}</p>
        <div className="mt-0.5 flex items-center justify-between gap-1">
          {model.categories.length > 0 ? (
            <p className="truncate text-[11px] text-zinc-500 sm:text-xs">{model.categories[0]}</p>
          ) : (
            <span />
          )}
          {model.location && (
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-zinc-400 sm:text-xs">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{model.location.split(",")[0]}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
