"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistrationAction } from "@/lib/actions";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Country = { id: string; name: string };
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
  const [categoryPickerId, setCategoryPickerId] = useState("");

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
      stateId: "",
      cityId: "",
      categoryIds: [],
      password: "",
    },
  });

  const selectedCountryId = watch("countryId");
  const selectedStateId = watch("stateId");
  const categoryIds = watch("categoryIds");

  const filteredStates = states.filter((s) => s.countryId === selectedCountryId);
  const filteredMunicipalities = municipalities.filter((m) => m.stateId === selectedStateId);
  const pickedCategories = categories.filter((c) => categoryIds.includes(c.id));

  async function onSubmit(data: RegistrationFormData) {
    setServerError(null);
    if (!captcha) return;
    if (data.captchaAnswer !== captcha.a + captcha.b) {
      setServerError("La respuesta de verificación no es correcta. Intenta de nuevo.");
      return;
    }
    const result = await submitRegistrationAction({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      countryId: data.countryId,
      cityId: data.cityId,
      categoryIds: data.categoryIds,
      password: data.password,
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
        {/* Nombre completo */}
        <div className="sm:col-span-2">
          <Input label="Nombre completo" {...register("fullName")} error={errors.fullName?.message} />
        </div>

        {/* Correo */}
        <Input label="Correo" type="email" {...register("email")} error={errors.email?.message} />

        {/* Teléfono */}
        <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />

        {/* Contraseña */}
        <div>
          <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
          <p className="mt-1 text-xs text-zinc-400">Úsala para acceder a tu perfil más adelante.</p>
        </div>

        {/* Fecha de nacimiento */}
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

        {/* Género */}
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

        {/* País */}
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

        {/* Estado */}
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

        {/* Ciudad */}
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

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Categorías <span className="text-zinc-400 font-normal">(mínimo 1)</span>
            </label>
            <div className="flex gap-2">
              <Select
                value={categoryPickerId}
                onChange={(e) => setCategoryPickerId(e.target.value)}
                placeholder="Selecciona una categoría…"
                className="flex-1"
              >
                {categories
                  .filter((c) => !categoryIds.includes(c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </Select>
              <Button
                variant="secondary"
                disabled={!categoryPickerId}
                onClick={() => {
                  if (categoryPickerId) {
                    setValue("categoryIds", [...categoryIds, categoryPickerId]);
                    setCategoryPickerId("");
                  }
                }}
              >
                + Agregar
              </Button>
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
