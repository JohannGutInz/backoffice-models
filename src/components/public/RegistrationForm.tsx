"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistrationAction } from "@/lib/actions";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { ModelMediaFields, type ModelMediaFieldsHandle } from "@/components/models/ModelMediaFields";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Country = { id: string; name: string; demonym: string };
type State = { id: string; name: string; countryId: string };
type Municipality = { id: string; name: string; stateId: string };
type Category = { id: string; name: string };

interface Props {
  maxDate: string;
  countries: Country[];
  states: State[];
  municipalities: Municipality[];
  categories: Category[];
}

function generateCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

export function RegistrationForm({ maxDate, countries, states, municipalities, categories }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const mediaFieldsRef = useRef<ModelMediaFieldsHandle>(null);

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      countryId: "",
      nationalityId: "",
      stateId: "",
      cityId: "",
      categoryIds: [],
      password: "",
      hasVisibleTattoos: false,
      travelAvailability: false,
      hasPassport: false,
      hasVisa: false,
      casualPhotoUrls: [],
      bookPhotoUrls: [],
      eventPhotoUrls: [],
      presentationVideoUrl: "",
      campaignVideoLinks: [],
    },
  });

  const selectedCountryId = watch("countryId");
  const selectedStateId = watch("stateId");
  const categoryIds = watch("categoryIds");
  const casualPhotoUrls = watch("casualPhotoUrls");
  const bookPhotoUrls = watch("bookPhotoUrls");
  const eventPhotoUrls = watch("eventPhotoUrls");
  const presentationVideoUrl = watch("presentationVideoUrl");
  const campaignVideoLinks = watch("campaignVideoLinks");

  const filteredStates = states.filter((s) => s.countryId === selectedCountryId);
  const filteredMunicipalities = municipalities.filter((m) => m.stateId === selectedStateId);

  async function onSubmit(data: RegistrationFormData) {
    setServerError(null);
    if (!captcha) return;
    if (data.captchaAnswer !== captcha.a + captcha.b) {
      setServerError("La respuesta de verificación no es correcta. Intenta de nuevo.");
      return;
    }

    let resolvedMedia = {
      casualPhotoUrls: data.casualPhotoUrls,
      bookPhotoUrls: data.bookPhotoUrls,
      eventPhotoUrls: data.eventPhotoUrls,
      presentationVideoUrl: data.presentationVideoUrl,
    };

    try {
      resolvedMedia = (await mediaFieldsRef.current?.resolvePending()) ?? resolvedMedia;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al subir archivos.");
      return;
    }

    const result = await submitRegistrationAction({
      firstName: data.firstName,
      paternalLastName: data.paternalLastName,
      maternalLastName: data.maternalLastName,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      countryId: data.countryId,
      nationalityId: data.nationalityId,
      cityId: data.cityId,
      password: data.password,
      height: data.height,
      currentWeight: data.currentWeight,
      hasVisibleTattoos: data.hasVisibleTattoos,
      shirtSize: data.shirtSize,
      pantsSizeScale: data.pantsSizeScale,
      pantsSize: data.pantsSize,
      travelAvailability: data.travelAvailability,
      hasPassport: data.hasPassport,
      hasVisa: data.hasVisa,
      categoryIds: data.categoryIds,
      ...resolvedMedia,
      campaignVideoLinks: data.campaignVideoLinks,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombre(s)" {...register("firstName")} error={errors.firstName?.message} />

          <Input
            label="Apellido paterno"
            {...register("paternalLastName")}
            error={errors.paternalLastName?.message}
          />

          <div className="sm:col-span-2">
            <Input
              label="Apellido materno (opcional)"
              {...register("maternalLastName")}
              error={errors.maternalLastName?.message}
            />
          </div>

          <Input label="Correo" type="email" {...register("email")} error={errors.email?.message} />

          <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />

          <div>
            <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
            <p className="mt-1 text-xs text-zinc-400">Úsala para acceder a tu perfil más adelante.</p>
          </div>

          <div>
            <Input
              label="Fecha de nacimiento"
              type="date"
              {...register("birthDate")}
              max={maxDate}
              error={errors.birthDate?.message}
            />
            <p className="mt-1 text-xs text-zinc-400">Solo aceptamos talento mayor de edad.</p>
          </div>

          <Select
            label="Género"
            {...register("gender")}
            defaultValue=""
            placeholder="Selecciona…"
            error={errors.gender?.message}
          >
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </Select>
        </div>
      </section>

      <section>
        <SectionTitle>Ubicación</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="País"
                  placeholder="Selecciona un país…"
                  error={errors.countryId?.message}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue("stateId", "");
                    setValue("cityId", "");
                  }}
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="sm:col-span-2">
            <Controller
              name="nationalityId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Nacionalidad"
                  placeholder="Selecciona una nacionalidad…"
                  error={errors.nationalityId?.message}
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.demonym}</option>
                  ))}
                </Select>
              )}
            />
          </div>

          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Estado"
                disabled={!selectedCountryId}
                placeholder={selectedCountryId ? "Selecciona un estado…" : "Primero selecciona un país"}
                error={errors.stateId?.message}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("cityId", "");
                }}
              >
                {filteredStates.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            )}
          />

          <Select
            label="Ciudad"
            {...register("cityId")}
            disabled={!selectedStateId}
            defaultValue=""
            placeholder={selectedStateId ? "Selecciona una ciudad…" : "Primero selecciona un estado"}
            error={errors.cityId?.message}
          >
            {filteredMunicipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
        </div>
      </section>

      {categories.length > 0 && (
        <section>
          <SectionTitle>Categorías</SectionTitle>
          <Controller
            name="categoryIds"
            control={control}
            render={() => (
              <MultiSelectPicker
                label="¿A qué te dedicas?"
                hint="(mínimo 1 — puedes elegir varias)"
                options={categories}
                selectedIds={categoryIds}
                onChange={(ids) => setValue("categoryIds", ids, { shouldValidate: true })}
                error={errors.categoryIds?.message}
                placeholder="Buscar categoría…"
              />
            )}
          />
        </section>
      )}

      <section>
        <SectionTitle>Atributos físicos</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Input
            type="number"
            label="Estatura (cm)"
            {...register("height", { valueAsNumber: true })}
            error={errors.height?.message}
          />
          <Input
            type="number"
            label="Peso (kg)"
            {...register("currentWeight", { valueAsNumber: true })}
            error={errors.currentWeight?.message}
          />
          <div className="hidden sm:block" />
          <Select
            label="Talla de camisa"
            {...register("shirtSize")}
            defaultValue=""
            placeholder="Selecciona…"
            error={errors.shirtSize?.message}
          >
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            label="Escala pantalón"
            {...register("pantsSizeScale")}
            defaultValue=""
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
          </Select>
          <Input label="Talla de pantalón" {...register("pantsSize")} error={errors.pantsSize?.message} />
          <div className="col-span-2 sm:col-span-3">
            <Checkbox label="¿Tienes tatuajes visibles?" {...register("hasVisibleTattoos")} />
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Disponibilidad</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Checkbox label="Disponible para viajar" {...register("travelAvailability")} />
          <Checkbox label="Tengo pasaporte" {...register("hasPassport")} />
          <Checkbox label="Tengo visa" {...register("hasVisa")} />
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle>Multimedia</SectionTitle>
        <ModelMediaFields
          ref={mediaFieldsRef}
          casualPhotos={{
            value: casualPhotoUrls,
            onChange: (urls) => setValue("casualPhotoUrls", urls, { shouldValidate: true }),
            error: errors.casualPhotoUrls?.message,
          }}
          bookPhotos={{
            value: bookPhotoUrls,
            onChange: (urls) => setValue("bookPhotoUrls", urls, { shouldValidate: true }),
            error: errors.bookPhotoUrls?.message,
          }}
          eventPhotos={{
            value: eventPhotoUrls,
            onChange: (urls) => setValue("eventPhotoUrls", urls, { shouldValidate: true }),
            error: errors.eventPhotoUrls?.message,
          }}
          presentationVideo={{
            value: presentationVideoUrl ?? "",
            onChange: (url) => setValue("presentationVideoUrl", url, { shouldValidate: true }),
            error: errors.presentationVideoUrl?.message,
          }}
          campaignLinks={{
            value: campaignVideoLinks,
            onChange: (urls) => setValue("campaignVideoLinks", urls, { shouldValidate: true }),
            error: errors.campaignVideoLinks?.message,
          }}
        />
      </section>

      {/* Captcha */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        {captcha ? (
          <Input
            type="number"
            label={`Verificación: ¿cuánto es ${captcha.a} + ${captcha.b}?`}
            {...register("captchaAnswer", { valueAsNumber: true })}
            className="w-32 py-2"
            error={errors.captchaAnswer?.message}
          />
        ) : (
          <p className="text-sm text-zinc-400">Cargando verificación…</p>
        )}
      </div>

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting || !captcha} className="rounded-full px-5">
        {isSubmitting ? "Enviando…" : "Enviar registro"} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-zinc-200 pb-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
      {children}
    </h2>
  );
}
