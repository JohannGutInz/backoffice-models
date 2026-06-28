"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ImagePlus, RefreshCw } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { guardarConfiguracionSitioAction, regenerarLinkRegistroAction, toggleRegistroPublicoAction } from "@/lib/actions";
import { configuracionSchema, type ConfiguracionData } from "@/lib/schemas";
import type { ConfiguracionSitio } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ConfiguracionForm({ config }: { config: ConfiguracionSitio }) {
  const [registroActivo, setRegistroActivo] = useState(config.registroPublicoActivo);
  const [slug, setSlug] = useState(config.registroLinkSlug);
  const [copiado, setCopiado] = useState(false);
  const [, startTransition] = useTransition();

  const registroUrl = `agencia.com/registro/${slug}`;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConfiguracionData>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      nombreAgencia: config.nombreAgencia,
      colorPrimario: config.colorPrimario,
      heroTitulo: config.heroTitulo,
      heroSubtitulo: config.heroSubtitulo,
    },
  });

  const colorPrimario = watch("colorPrimario");

  async function onSubmit(data: ConfiguracionData) {
    await guardarConfiguracionSitioAction(data);
  }

  function handleToggleRegistro() {
    const next = !registroActivo;
    setRegistroActivo(next);
    startTransition(() => {
      toggleRegistroPublicoAction(next);
    });
  }

  function handleRegenerar() {
    startTransition(async () => {
      const nuevoSlug = await regenerarLinkRegistroAction();
      setSlug(nuevoSlug);
      setCopiado(false);
    });
  }

  function handleCopiar() {
    navigator.clipboard?.writeText(registroUrl).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Identidad del sitio" subtitle="Se refleja en la landing pública." />
        <div className="grid grid-cols-1 gap-5 px-5 pb-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre de la agencia</label>
            <input
              {...register("nombreAgencia")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.nombreAgencia && <p className="mt-1 text-xs text-rose-600">{errors.nombreAgencia.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Color primario</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorPrimario}
                onChange={(e) => setValue("colorPrimario", e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-zinc-300"
              />
              <input
                {...register("colorPrimario")}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm uppercase outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              />
            </div>
            {errors.colorPrimario && <p className="mt-1 text-xs text-rose-600">{errors.colorPrimario.message}</p>}
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
              {...register("heroTitulo")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.heroTitulo && <p className="mt-1 text-xs text-rose-600">{errors.heroTitulo.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Subtítulo</label>
            <textarea
              {...register("heroSubtitulo")}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.heroSubtitulo && <p className="mt-1 text-xs text-rose-600">{errors.heroSubtitulo.message}</p>}
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
              onClick={handleToggleRegistro}
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

          <Button type="button" variant="secondary" onClick={handleRegenerar}>
            <RefreshCw className="h-4 w-4" /> Regenerar link (invalida el anterior)
          </Button>
        </div>
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
