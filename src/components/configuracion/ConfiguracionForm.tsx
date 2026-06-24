"use client";

import { useState } from "react";
import { Check, Copy, ImagePlus, RefreshCw } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ConfiguracionSitio } from "@/lib/types";

function randomSlug() {
  return `registro-musa-${Math.random().toString(36).slice(2, 8)}`;
}

export function ConfiguracionForm({ config }: { config: ConfiguracionSitio }) {
  const [nombreAgencia, setNombreAgencia] = useState(config.nombreAgencia);
  const [colorPrimario, setColorPrimario] = useState(config.colorPrimario);
  const [heroTitulo, setHeroTitulo] = useState(config.heroTitulo);
  const [heroSubtitulo, setHeroSubtitulo] = useState(config.heroSubtitulo);
  const [registroActivo, setRegistroActivo] = useState(config.registroPublicoActivo);
  const [slug, setSlug] = useState(config.registroLinkSlug);
  const [copiado, setCopiado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const registroUrl = `agencia.com/registro/${slug}`;

  function handleRegenerar() {
    setSlug(randomSlug());
    setCopiado(false);
  }

  function handleCopiar() {
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  function handleGuardar() {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Identidad del sitio" subtitle="Se refleja en la landing pública." />
        <div className="grid grid-cols-1 gap-5 px-5 pb-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre de la agencia</label>
            <input
              value={nombreAgencia}
              onChange={(e) => setNombreAgencia(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Color primario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorPrimario}
                onChange={(e) => setColorPrimario(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-300"
              />
              <input
                value={colorPrimario}
                onChange={(e) => setColorPrimario(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm uppercase outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Logo</label>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-8 text-zinc-400 hover:border-gold-400 hover:text-gold-600"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">Arrastra tu logo o haz clic para subir (PNG/SVG)</span>
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Textos del hero" subtitle="Encabezado principal de la landing." />
        <div className="space-y-4 px-5 pb-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Título</label>
            <input
              value={heroTitulo}
              onChange={(e) => setHeroTitulo(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Subtítulo</label>
            <textarea
              value={heroSubtitulo}
              onChange={(e) => setHeroSubtitulo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Registro público de aspirantes" subtitle="Auto-registro vía link único y regenerable." />
        <div className="space-y-4 px-5 pb-5">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
            <div>
              <p className="text-sm font-medium text-zinc-800">Link visible en la landing</p>
              <p className="text-xs text-zinc-500">
                {registroActivo
                  ? "Cualquier visitante puede encontrar el formulario de registro."
                  : "El link sigue activo pero solo se comparte en privado."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={registroActivo}
              onClick={() => setRegistroActivo((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                registroActivo ? "bg-zinc-950" : "bg-zinc-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  registroActivo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <span className="flex-1 truncate text-sm text-zinc-600">{registroUrl}</span>
            <button
              type="button"
              onClick={handleCopiar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
              aria-label="Copiar link"
            >
              {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <Button variant="secondary" onClick={handleRegenerar}>
            <RefreshCw className="h-4 w-4" /> Regenerar link (invalida el anterior)
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleGuardar}>Guardar cambios</Button>
        {guardado && <span className="text-sm text-emerald-600">✓ Cambios guardados</span>}
      </div>
    </div>
  );
}
