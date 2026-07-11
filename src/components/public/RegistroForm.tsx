"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistroAction } from "@/lib/actions";
import { registroFormSchema, type RegistroFormData } from "@/lib/schemas";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MediaSection } from "@/components/modelos/MediaSection";

type Country = { id: string; name: string };
type State = { id: string; name: string; countryId: string };
type Municipality = { id: string; name: string; stateId: string };
type Category = { id: string; name: string };

interface Props {
  maxFecha: string;
  countries: Country[];
  states: State[];
  municipalities: Municipality[];
  categories: Category[];
}

const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const SELECT_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function generarCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="sm:col-span-2 mt-2 flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-[11px] text-zinc-300 italic">opcional</span>
    </div>
  );
}

export function RegistroForm({ maxFecha, countries, states, municipalities, categories }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const [categoryPickerId, setCategoryPickerId] = useState("");

  useEffect(() => {
    setCaptcha(generarCaptcha());
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroFormSchema),
    defaultValues: {
      countryId: "",
      stateId: "",
      cityId: "",
      categoryIds: [],
      hasVisibleTattoos: false,
      availableToTravel: false,
      hasPassport: false,
      hasVisaUS: false,
    },
  });

  const selectedCountryId = watch("countryId");
  const selectedStateId = watch("stateId");
  const categoryIds = watch("categoryIds");

  const filteredStates = states.filter((s) => s.countryId === selectedCountryId);
  const filteredMunicipalities = municipalities.filter((m) => m.stateId === selectedStateId);
  const pickedCategories = categories.filter((c) => categoryIds.includes(c.id));

  async function onSubmit(data: RegistroFormData) {
    setServerError(null);
    if (!captcha) return;
    if (data.captchaRespuesta !== captcha.a + captcha.b) {
      setServerError("La respuesta de verificación no es correcta. Intenta de nuevo.");
      return;
    }
    const result = await submitRegistroAction({
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      correo: data.correo,
      telefono: data.telefono,
      fechaNacimiento: data.fechaNacimiento,
      genero: data.genero,
      countryId: data.countryId,
      cityId: data.cityId,
      categoryIds: data.categoryIds,
      artisticName: data.artisticName,
      nationality: data.nationality,
      height: data.height,
      weight: data.weight,
      hasVisibleTattoos: data.hasVisibleTattoos,
      shirtSize: data.shirtSize,
      pantsSize: data.pantsSize,
      availableToTravel: data.availableToTravel,
      hasPassport: data.hasPassport,
      hasVisaUS: data.hasVisaUS,
    });
    if (result.status === "error") setServerError(result.message);
    else setSuccess(result.message);
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Nombres */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombres <span className="text-rose-500">*</span></label>
          <input {...register("nombres")} placeholder="Juan Pablo" className={INPUT_CLASS} />
          {errors.nombres && <p className="mt-1 text-xs text-rose-600">{errors.nombres.message}</p>}
        </div>

        {/* Apellido paterno */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Apellido paterno <span className="text-rose-500">*</span></label>
          <input {...register("apellidoPaterno")} className={INPUT_CLASS} />
          {errors.apellidoPaterno && <p className="mt-1 text-xs text-rose-600">{errors.apellidoPaterno.message}</p>}
        </div>

        {/* Apellido materno */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Apellido materno</label>
          <input {...register("apellidoMaterno")} className={INPUT_CLASS} />
        </div>

        {/* Nombre artístico */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre artístico</label>
          <input {...register("artisticName")} placeholder="Nombre para catálogo" className={INPUT_CLASS} />
        </div>

        {/* Correo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo <span className="text-rose-500">*</span></label>
          <input type="email" {...register("correo")} className={INPUT_CLASS} />
          {errors.correo && <p className="mt-1 text-xs text-rose-600">{errors.correo.message}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Teléfono <span className="text-rose-500">*</span></label>
          <input {...register("telefono")} className={INPUT_CLASS} />
          {errors.telefono && <p className="mt-1 text-xs text-rose-600">{errors.telefono.message}</p>}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Fecha de nacimiento <span className="text-rose-500">*</span></label>
          <input type="date" {...register("fechaNacimiento")} max={maxFecha} className={INPUT_CLASS} />
          <p className="mt-1 text-xs text-zinc-400">Solo aceptamos talento mayor de edad.</p>
          {errors.fechaNacimiento && <p className="mt-1 text-xs text-rose-600">{errors.fechaNacimiento.message}</p>}
        </div>

        {/* Género */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Género <span className="text-rose-500">*</span></label>
          <select {...register("genero")} defaultValue="" className={SELECT_CLASS}>
            <option value="" disabled>Selecciona…</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </select>
          {errors.genero && <p className="mt-1 text-xs text-rose-600">{errors.genero.message}</p>}
        </div>

        {/* Nacionalidad */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nacionalidad</label>
          <input {...register("nationality")} placeholder="Mexicana, Colombiana…" className={INPUT_CLASS} />
        </div>

        {/* País */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">País <span className="text-rose-500">*</span></label>
          <Controller
            name="countryId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("stateId", "");
                  setValue("cityId", "");
                }}
                className={SELECT_CLASS}
              >
                <option value="" disabled>Selecciona un país…</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          />
          {errors.countryId && <p className="mt-1 text-xs text-rose-600">{errors.countryId.message}</p>}
        </div>

        {/* Estado */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Estado <span className="text-rose-500">*</span></label>
          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                disabled={!selectedCountryId}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("cityId", "");
                }}
                className={SELECT_CLASS}
              >
                <option value="" disabled>
                  {selectedCountryId ? "Selecciona un estado…" : "Primero selecciona un país"}
                </option>
                {filteredStates.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          />
          {errors.stateId && <p className="mt-1 text-xs text-rose-600">{errors.stateId.message}</p>}
        </div>

        {/* Ciudad */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Ciudad <span className="text-rose-500">*</span></label>
          <select
            {...register("cityId")}
            disabled={!selectedStateId}
            defaultValue=""
            className={SELECT_CLASS}
          >
            <option value="" disabled>
              {selectedStateId ? "Selecciona una ciudad…" : "Primero selecciona un estado"}
            </option>
            {filteredMunicipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.cityId && <p className="mt-1 text-xs text-rose-600">{errors.cityId.message}</p>}
        </div>

        {/* ── Datos físicos ── */}
        <SectionDivider label="Datos físicos" />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Estatura (cm)</label>
          <input type="number" {...register("height")} placeholder="170" min={100} max={220} className={INPUT_CLASS} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Peso (kg)</label>
          <input type="number" {...register("weight")} placeholder="60" step="0.1" min={30} max={200} className={INPUT_CLASS} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Talla de camisa</label>
          <select {...register("shirtSize")} defaultValue="" className={SELECT_CLASS}>
            <option value="">Sin especificar</option>
            {SHIRT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Talla de pantalón</label>
          <input {...register("pantsSize")} placeholder="28, 30, M…" className={INPUT_CLASS} />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              {...register("hasVisibleTattoos")}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm font-medium text-zinc-700">Tengo tatuajes visibles</span>
          </label>
        </div>

        {/* ── Disponibilidad ── */}
        <SectionDivider label="Disponibilidad" />

        <div className="sm:col-span-2 space-y-3">
          {(
            [
              { name: "availableToTravel", label: "Estoy disponible para viajar" },
              { name: "hasPassport", label: "Tengo pasaporte" },
              { name: "hasVisaUS", label: "Tengo visa para Estados Unidos" },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...register(name)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">{label}</span>
            </label>
          ))}
        </div>

        {/* Multimedia — placeholder */}
        <div className="sm:col-span-2">
          <MediaSection />
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Categorías <span className="text-zinc-400 font-normal">(mínimo 1)</span> <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={categoryPickerId}
                onChange={(e) => setCategoryPickerId(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
              >
                <option value="" disabled>Selecciona una categoría…</option>
                {categories
                  .filter((c) => !categoryIds.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!categoryPickerId}
                onClick={() => {
                  if (categoryPickerId) {
                    setValue("categoryIds", [...categoryIds, categoryPickerId]);
                    setCategoryPickerId("");
                  }
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                + Agregar
              </button>
            </div>
            {pickedCategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {pickedCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                  >
                    {cat.name}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "categoryIds",
                          categoryIds.filter((id) => id !== cat.id)
                        )
                      }
                      className="ml-0.5 text-zinc-400 hover:text-zinc-700"
                      aria-label={`Quitar ${cat.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.categoryIds && <p className="mt-1 text-xs text-rose-600">{errors.categoryIds.message}</p>}
          </div>
        )}
      </div>

      {/* Captcha */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        {captcha ? (
          <>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Verificación: ¿cuánto es {captcha.a} + {captcha.b}?
            </label>
            <input
              type="number"
              {...register("captchaRespuesta", { valueAsNumber: true })}
              className="w-32 rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.captchaRespuesta && (
              <p className="mt-1 text-xs text-rose-600">{errors.captchaRespuesta.message}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-400">Cargando verificación…</p>
        )}
      </div>

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !captcha}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Enviar registro"} <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
