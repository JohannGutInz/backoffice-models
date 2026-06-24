"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistroAction, type ActionState } from "@/lib/actions";
import { CATEGORIA_LABEL } from "@/lib/labels";

const initialState: ActionState = { status: "idle", message: "" };

function generarCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

export function RegistroForm({ maxFecha }: { maxFecha: string }) {
  const [state, formAction, pending] = useActionState(submitRegistroAction, initialState);
  // Generado solo en el cliente, después de montar: si se genera durante el
  // render (incluso en un lazy initializer), el SSR y la hidratación calculan
  // valores distintos de Math.random() y React lanza un mismatch de hidratación.
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  useEffect(() => {
    // Única excepción intencional: el valor debe nacer en el cliente (no SSR),
    // no sincroniza nada externo en curso, por eso no aplica la alternativa habitual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCaptcha(generarCaptcha());
  }, []);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre completo</label>
          <input
            name="nombreCompleto"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
          <input
            type="email"
            name="correo"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Teléfono</label>
          <input
            name="telefono"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Fecha de nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            required
            max={maxFecha}
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
          <p className="mt-1 text-xs text-zinc-400">Solo aceptamos talento mayor de edad.</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Género</label>
          <select
            name="genero"
            required
            defaultValue=""
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
          >
            <option value="" disabled>
              Selecciona…
            </option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="no binario">No binario</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nacionalidad</label>
          <input
            name="nacionalidad"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Ciudad</label>
          <input
            name="ubicacion"
            required
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Categoría</label>
          <select
            name="categoria"
            required
            defaultValue=""
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500"
          >
            <option value="" disabled>
              Selecciona…
            </option>
            {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
