"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistroAction, type ActionState } from "@/lib/actions";

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

const initialState: ActionState = { status: "idle", message: "" };

const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

function generarCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

export function RegistroForm({ maxFecha, countries, states, municipalities, categories }: Props) {
  const [state, formAction, pending] = useActionState(submitRegistroAction, initialState);
  const [, startTransition] = useTransition();
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [pickedCategories, setPickedCategories] = useState<Category[]>([]);
  const [categoryPickerId, setCategoryPickerId] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaptcha(generarCaptcha());
  }, []);

  const filteredStates = states.filter((s) => s.countryId === selectedCountryId);
  const filteredMunicipalities = municipalities.filter((m) => m.stateId === selectedStateId);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => formAction(new FormData(e.currentTarget)));
      }}
      className="space-y-4"
    >
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Nombre completo */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre completo</label>
          <input name="nombreCompleto" required className={INPUT_CLASS} />
        </div>

        {/* Correo */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
          <input type="email" name="correo" required className={INPUT_CLASS} />
        </div>

        {/* Teléfono */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Teléfono</label>
          <input name="telefono" required className={INPUT_CLASS} />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Fecha de nacimiento</label>
          <input type="date" name="fechaNacimiento" required max={maxFecha} className={INPUT_CLASS} />
          <p className="mt-1 text-xs text-zinc-400">Solo aceptamos talento mayor de edad.</p>
        </div>

        {/* Género */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Género</label>
          <select
            name="genero"
            required
            defaultValue=""
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
          >
            <option value="" disabled>Selecciona…</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </select>
        </div>

        {/* País */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">País</label>
          <select
            name="countryId"
            required
            value={selectedCountryId}
            onChange={(e) => {
              setSelectedCountryId(e.target.value);
              setSelectedStateId("");
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
          >
            <option value="" disabled>Selecciona un país…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Estado</label>
          <select
            name="stateId"
            required
            value={selectedStateId}
            disabled={!selectedCountryId}
            onChange={(e) => {
              setSelectedStateId(e.target.value);
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
          >
            <option value="" disabled>
              {selectedCountryId ? "Selecciona un estado…" : "Primero selecciona un país"}
            </option>
            {filteredStates.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Ciudad */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Ciudad</label>
          <select
            name="cityId"
            required
            disabled={!selectedStateId}
            defaultValue=""
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
          >
            <option value="" disabled>
              {selectedStateId ? "Selecciona una ciudad…" : "Primero selecciona un estado"}
            </option>
            {filteredMunicipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Categorías */}
        {categories.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Categorías <span className="text-zinc-400 font-normal">(mínimo 1)</span>
            </label>
            <div className="flex gap-2">
              <select
                value={categoryPickerId}
                onChange={(e) => setCategoryPickerId(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
              >
                <option value="" disabled>Selecciona una categoría…</option>
                {categories
                  .filter((c) => !pickedCategories.some((p) => p.id === c.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!categoryPickerId}
                onClick={() => {
                  const cat = categories.find((c) => c.id === categoryPickerId);
                  if (cat) {
                    setPickedCategories((prev) => [...prev, cat]);
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
                    <input type="hidden" name="categoryIds" value={cat.id} />
                    {cat.name}
                    <button
                      type="button"
                      onClick={() => setPickedCategories((prev) => prev.filter((p) => p.id !== cat.id))}
                      className="ml-0.5 text-zinc-400 hover:text-zinc-700"
                      aria-label={`Quitar ${cat.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Captcha */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        {captcha ? (
          <>
            <input type="hidden" name="captchaA" value={captcha.a} />
            <input type="hidden" name="captchaB" value={captcha.b} />
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              Verificación: ¿cuánto es {captcha.a} + {captcha.b}?
            </label>
            <input
              type="number"
              name="captchaRespuesta"
              required
              className="w-32 rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </>
        ) : (
          <p className="text-sm text-zinc-400">Cargando verificación…</p>
        )}
      </div>

      {state.status === "error" && <p className="text-sm text-rose-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending || !captcha}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar registro"} <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
