import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera, MapPin } from "lucide-react";
import { getPublicModel } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";
import { formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getPublicModel(id);

  if (!model) notFound();
  if (model.kycStatus !== "APPROVED") redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/talentos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Talentos
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            {model.mainPhotoUrl ? (
              <Image src={model.mainPhotoUrl} alt={formatFullName(model)} fill className="object-cover" unoptimized />
            ) : (
              <Avatar name={formatFullName(model)} size="xl" />
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {model.categories.length > 0 && (
            <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">
              {model.categories.join(" · ")}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-light tracking-tight text-zinc-950">{formatFullName(model)}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span>{GENRE_LABEL[model.genre] ?? model.genre}</span>
            {model.location && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {model.location}
                </span>
              </>
            )}
            <span>·</span>
            <span>{model.nationality}</span>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-100 pt-6 sm:grid-cols-3">
            {model.height && (
              <div>
                <dt className="text-xs text-zinc-400">Estatura</dt>
                <dd className="text-sm text-zinc-800">{model.height} cm</dd>
              </div>
            )}
            {model.currentWeight && (
              <div>
                <dt className="text-xs text-zinc-400">Peso</dt>
                <dd className="text-sm text-zinc-800">{model.currentWeight} kg</dd>
              </div>
            )}
            {model.shirtSize && (
              <div>
                <dt className="text-xs text-zinc-400">Talla de camisa</dt>
                <dd className="text-sm text-zinc-800">{model.shirtSize}</dd>
              </div>
            )}
            {model.pantsSize && (
              <div>
                <dt className="text-xs text-zinc-400">Talla de pantalón</dt>
                <dd className="text-sm text-zinc-800">
                  {model.pantsSize} {model.pantsSizeScale && `(${model.pantsSizeScale === "MEN" ? "Hombre" : "Mujer"})`}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-zinc-400">Tatuajes visibles</dt>
              <dd className="text-sm text-zinc-800">{model.hasVisibleTattoos ? "Sí" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">Disponibilidad para viajar</dt>
              <dd className="text-sm text-zinc-800">{model.travelAvailability ? "Sí" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">Pasaporte</dt>
              <dd className="text-sm text-zinc-800">{model.hasPassport ? "Sí" : "No"}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">Visa</dt>
              <dd className="text-sm text-zinc-800">{model.hasVisa ? "Sí" : "No"}</dd>
            </div>
          </dl>

          {model.activities.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-zinc-400">Actividades</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {model.activities.map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/contacto?modelo=${encodeURIComponent(formatFullName(model))}`}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Contactar a la agencia sobre {model.firstName} <ArrowRight className="h-4 w-4" />
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
