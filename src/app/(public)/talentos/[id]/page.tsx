import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, MapPin } from "lucide-react";
import { getVitrinaModelo } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function TalentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modelo = await getVitrinaModelo(id);

  if (!modelo) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/talentos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Talentos
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <Avatar name={modelo.fullName} size="xl" />
          </div>
        </div>

        <div className="lg:col-span-2">
          {modelo.categories.length > 0 && (
            <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">
              {modelo.categories.join(" · ")}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-light tracking-tight text-zinc-950">{modelo.fullName}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span>{GENRE_LABEL[modelo.genre] ?? modelo.genre}</span>
            {modelo.location && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {modelo.location}
                </span>
              </>
            )}
          </div>

          <Link
            href={`/contacto?modelo=${encodeURIComponent(modelo.fullName)}`}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Contactar a la agencia sobre {modelo.fullName.split(" ")[0]} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-16 border-t border-zinc-100 pt-10">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Book</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[10px]">Próximamente</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
