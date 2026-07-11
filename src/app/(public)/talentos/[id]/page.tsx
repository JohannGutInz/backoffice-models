import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, MapPin, Plane } from "lucide-react";
import { getVitrinaModelo } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-zinc-100 last:border-0">
      <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium shrink-0">{label}</span>
      <span className="text-sm text-zinc-800 text-right">{value}</span>
    </div>
  );
}

export default async function TalentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modelo = await getVitrinaModelo(id);

  if (!modelo) notFound();

  const hasFisica =
    modelo.height ||
    modelo.weight ||
    modelo.shirtSize ||
    modelo.pantsSize ||
    modelo.hasVisibleTattoos !== null;

  const disponibilidadItems = [
    modelo.availableToTravel && "Disponible para viajar",
    modelo.hasPassport && "Tiene pasaporte",
    modelo.hasVisaUS && "Tiene visa para EE. UU.",
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/talentos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Talentos
      </Link>

      {/* Hero */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <Avatar name={modelo.fullName} size="xl" />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col justify-center">
          {modelo.categories.length > 0 && (
            <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">
              {modelo.categories.join(" · ")}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-light tracking-tight text-zinc-950">{modelo.fullName}</h1>
          {modelo.artisticName && (
            <p className="mt-0.5 text-sm text-zinc-400 italic">&ldquo;{modelo.artisticName}&rdquo;</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span>{GENRE_LABEL[modelo.genre] ?? modelo.genre}</span>
            {modelo.nationality && (
              <>
                <span>·</span>
                <span>{modelo.nationality}</span>
              </>
            )}
            {modelo.location && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {modelo.location}
                </span>
              </>
            )}
          </div>

          {disponibilidadItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {disponibilidadItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                >
                  <Plane className="h-3 w-3" /> {item}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/contacto?modelo=${encodeURIComponent(modelo.fullName)}`}
            className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Contactar a la agencia sobre {modelo.fullName.split(" ")[0]}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Datos físicos */}
      {hasFisica && (
        <div className="mt-14 border-t border-zinc-100 pt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Datos físicos
          </h2>
          <div className="max-w-sm">
            {modelo.height && (
              <DataRow label="Estatura" value={`${modelo.height} cm`} />
            )}
            {modelo.weight && (
              <DataRow label="Peso" value={`${modelo.weight} kg`} />
            )}
            {modelo.shirtSize && (
              <DataRow label="Talla camisa" value={modelo.shirtSize} />
            )}
            {modelo.pantsSize && (
              <DataRow label="Talla pantalón" value={modelo.pantsSize} />
            )}
            {modelo.hasVisibleTattoos !== null && (
              <DataRow
                label="Tatuajes visibles"
                value={modelo.hasVisibleTattoos ? "Sí" : "No"}
              />
            )}
          </div>
        </div>
      )}

      {/* Book / fotos */}
      <div className="mt-14 border-t border-zinc-100 pt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">Book</h2>
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
