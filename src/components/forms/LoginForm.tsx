"use client";

import { loginAction } from "@/lib/actions";
import { loginSchema, type LoginData } from "@/lib/schemas";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginData) {
    setServerError(null);
    const result = await loginAction(data);
    if (result.status === "error") setServerError(result.message);
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-zinc-950 px-16 py-14 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative text-2xl font-semibold tracking-tight">
          Glamour<span className="text-gold-400">Models</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-light text-zinc-100">
            La plataforma que ordena el talento, los eventos y los clientes de tu agencia
            <span className="text-gold-400">.</span>
          </p>
          <p className="mt-6 text-sm text-zinc-500">
            Backoffice interno — acceso restringido al staff de la agencia.
          </p>
        </div>
        <p className="relative text-xs text-zinc-600">© {new Date().getFullYear()} GlamourModels. Todos los derechos reservados.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="text-2xl font-semibold tracking-tight text-zinc-950">
              Glamour<span className="text-gold-500">Models</span>
            </span>
          </div>

          <h1 className="text-xl font-semibold text-zinc-900">Inicia sesión</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Ingresa el correo y la contraseña de un usuario registrado.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Correo
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                  placeholder="tu@agencia.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="password"
                  {...register("password")}
                  type="password"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

            <div className="flex items-center justify-between pt-1 text-sm">
              <label className="flex items-center gap-2 text-zinc-600">
                <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-gold-600 focus:ring-gold-500" />
                Recordarme
              </label>
              <a href="#" className="font-medium text-zinc-500 hover:text-gold-600">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-zinc-950 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            Acceso exclusivo para staff autorizado de la agencia.
          </p>
        </div>
      </div>
    </div>
  );
}
