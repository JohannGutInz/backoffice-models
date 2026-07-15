import { ImageIcon, Link2, Video } from "lucide-react";

const PHOTO_SECTIONS = [
  {
    id: "casual",
    label: "Fotos caseras",
    hint: "Fotos naturales, sin producción.",
    count: 5,
  },
  {
    id: "book",
    label: "Fotos de book",
    hint: "Fotos profesionales de tu portafolio.",
    count: 5,
  },
  {
    id: "eventos",
    label: "Fotos de eventos",
    hint: "Fotos en eventos donde hayas trabajado.",
    count: 5,
  },
];

export function MediaSection() {
  return (
    <div className="space-y-8">
      {/* Header de sección */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Multimedia
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600">
          Próximamente
        </span>
      </div>

      {/* Secciones de fotos */}
      {PHOTO_SECTIONS.map((section) => (
        <div key={section.id}>
          <p className="text-sm font-medium text-zinc-700">{section.label}</p>
          <p className="mb-3 mt-0.5 text-xs text-zinc-400">{section.hint}</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {Array.from({ length: section.count }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-square cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-300"
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-[9px] font-medium uppercase tracking-wide">Foto</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Video de presentación */}
      <div>
        <p className="text-sm font-medium text-zinc-700">Video de presentación</p>
        <p className="mb-3 mt-0.5 text-xs text-zinc-400">
          Un video corto presentándote — quién eres, qué haces, cómo te expresas.
        </p>
        <div className="flex h-28 cursor-not-allowed items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50">
          <div className="flex flex-col items-center gap-2 text-zinc-300">
            <Video className="h-7 w-7" />
            <span className="text-xs">Subir video</span>
          </div>
        </div>
      </div>

      {/* Links a campañas */}
      <div>
        <p className="text-sm font-medium text-zinc-700">Links a videos de campañas</p>
        <p className="mb-3 mt-0.5 text-xs text-zinc-400">
          Comparte links de YouTube, Vimeo u otras plataformas donde aparezcas como modelo.
        </p>
        <div className="pointer-events-none cursor-not-allowed space-y-2 opacity-50">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5">
              <Link2 className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="text-sm text-zinc-400">https://youtube.com/…</span>
            </div>
            <button
              type="button"
              disabled
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium text-zinc-400"
            >
              + Agregar
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5">
              <Link2 className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="text-sm text-zinc-400">https://vimeo.com/…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
