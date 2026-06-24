import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { getVitrinaModelo } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";
import { CATEGORIA_LABEL } from "@/lib/labels";

export default async function TalentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modelo = await getVitrinaModelo(id);

  // Si el id existe pero no está activo y marcado público, no debe ser visible
  // ni siquiera accediendo a la URL directamente — es la separación de permisos
  // que CLAUDE-proyecto-real.md marca como punto crítico a probar.
  if (!modelo) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/talentos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Talentos
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
            <Avatar name={modelo.nombreArtistico} size="xl" />
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs font-medium tracking-wide text-gold-700 uppercase">{CATEGORIA_LABEL[modelo.categoria]}</p>
          <h1 className="mt-1 text-3xl font-light tracking-tight text-zinc-950">{modelo.nombreArtistico}</h1>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {modelo.etiquetas.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                {tag}
              </span>
            ))}
          </div>

          {modelo.fisico && (
            <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-zinc-100 pt-6 sm:grid-cols-3">
              {modelo.fisico.estaturaCm && (
                <div>
                  <dt className="text-xs text-zinc-400">Estatura</dt>
                  <dd className="text-sm text-zinc-800">{modelo.fisico.estaturaCm} cm</dd>
                </div>
              )}
              {modelo.fisico.medidas && (
                <div>
                  <dt className="text-xs text-zinc-400">Medidas</dt>
                  <dd className="text-sm text-zinc-800">{modelo.fisico.medidas}</dd>
                </div>
              )}
              {modelo.fisico.tallas && (
                <div>
                  <dt className="text-xs text-zinc-400">Talla</dt>
                  <dd className="text-sm text-zinc-800">{modelo.fisico.tallas}</dd>
                </div>
              )}
              {modelo.fisico.colorCabello && (
                <div>
                  <dt className="text-xs text-zinc-400">Cabello</dt>
                  <dd className="text-sm text-zinc-800">{modelo.fisico.colorCabello}</dd>
                </div>
              )}
              {modelo.fisico.colorOjos && (
                <div>
                  <dt className="text-xs text-zinc-400">Ojos</dt>
                  <dd className="text-sm text-zinc-800">{modelo.fisico.colorOjos}</dd>
                </div>
              )}
            </dl>
          )}

          <Link
            href={`/contacto?modelo=${encodeURIComponent(modelo.nombreArtistico)}`}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600"
          >
            Contactar a la agencia sobre {modelo.nombreArtistico.split(" ")[0]} <ArrowRight className="h-4 w-4" />
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
