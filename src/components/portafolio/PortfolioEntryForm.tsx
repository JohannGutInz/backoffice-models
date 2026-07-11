"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Star, Save, Trash2 } from "lucide-react";
import { portfolioEntrySchema, type PortfolioEntryData } from "@/lib/schemas";
import { crearPortfolioEntryAction, editarPortfolioEntryAction, eliminarPortfolioEntryAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}
function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-rose-600">{msg}</p>;
}

const MAX_FOTOS = 6;

interface Props {
  mode: "create" | "edit";
  entryId?: string;
  defaultValues?: Partial<PortfolioEntryData>;
}

export function PortfolioEntryForm({ mode, entryId, defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioEntryData>({
    resolver: zodResolver(portfolioEntrySchema),
    defaultValues: {
      marca: "",
      fecha: "",
      lugar: "",
      isVisible: false,
      fotos: [{ url: "", isPortada: true, orden: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fotos" });

  function setPortada(index: number) {
    const fotos = getValues("fotos");
    setValue(
      "fotos",
      fotos.map((f, i) => ({ ...f, isPortada: i === index })),
    );
  }

  async function onSubmit(data: PortfolioEntryData) {
    setServerError(null);
    const result =
      mode === "create"
        ? await crearPortfolioEntryAction(data)
        : await editarPortfolioEntryAction(entryId!, data);

    if (result.status === "error") {
      setServerError(result.message);
      return;
    }

    const dest =
      mode === "create" && "entryId" in result && result.entryId
        ? `${APP_ROUTE.app.portafolio.index}/${result.entryId}`
        : `${APP_ROUTE.app.portafolio.index}/${entryId}`;
    router.push(dest);
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta entrada del portafolio?")) return;
    await eliminarPortfolioEntryAction(entryId!);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label required>Línea o marca</Label>
          <input {...register("marca")} className={INPUT} placeholder="Ej. Armani, Nike, Liverpool…" />
          <Err msg={errors.marca?.message} />
        </div>
        <div>
          <Label required>Fecha</Label>
          <input {...register("fecha")} className={INPUT} placeholder="Ej. Julio 2026" />
          <Err msg={errors.fecha?.message} />
        </div>
        <div>
          <Label required>Lugar</Label>
          <input {...register("lugar")} className={INPUT} placeholder="Ej. Liverpool Guadalajara" />
          <Err msg={errors.lugar?.message} />
        </div>
      </div>

      {/* Fotos */}
      <div>
        <Label>Fotos</Label>
        <p className="mb-3 text-xs text-zinc-400">
          Pega la URL de cada foto. La primera marcada como portada es la que aparece en la grilla pública.
        </p>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              {/* Thumbnail preview */}
              <Controller
                control={control}
                name={`fotos.${index}.url`}
                render={({ field: f }) => (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {f.value ? (
                      <img
                        src={f.value}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300 text-xs">
                        foto
                      </div>
                    )}
                    {/* Portada badge */}
                    <Controller
                      control={control}
                      name={`fotos.${index}.isPortada`}
                      render={({ field: pf }) =>
                        pf.value ? (
                          <span className="absolute left-0 top-0 rounded-br-md bg-gold-500 px-1 py-0.5 text-[9px] font-bold text-zinc-950 uppercase leading-none">
                            portada
                          </span>
                        ) : <></>
                      }
                    />
                  </div>
                )}
              />

              {/* URL input */}
              <input
                {...register(`fotos.${index}.url`)}
                className={cn(INPUT, "flex-1")}
                placeholder="https://... o /ruta/imagen.jpg"
              />

              {/* Set portada */}
              <button
                type="button"
                onClick={() => setPortada(index)}
                title="Marcar como portada"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-gold-400 hover:text-gold-500"
              >
                <Star className="h-4 w-4" />
              </button>

              {/* Remove */}
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:border-rose-300 hover:text-rose-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {fields.length < MAX_FOTOS && (
          <button
            type="button"
            onClick={() => append({ url: "", isPortada: false, orden: fields.length })}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
          >
            <Plus className="h-4 w-4" /> Añadir foto
          </button>
        )}
      </div>

      {/* Visible toggle */}
      <Controller
        control={control}
        name="isVisible"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => field.onChange(!field.value)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                field.value ? "bg-gold-500" : "bg-zinc-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  field.value ? "left-4" : "left-0.5",
                )}
              />
            </div>
            <span className="text-sm font-medium text-zinc-700">Visible en el sitio</span>
          </label>
        )}
      />

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</p>
      )}

      <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </button>
        )}
        <div className={cn("flex gap-3", mode === "create" && "ml-auto")}>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : mode === "create" ? "Crear entrada" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
