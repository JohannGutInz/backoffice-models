"use client";

import { useState, useTransition } from "react";
import { toggleVisibilidadLandingAction } from "@/lib/actions";

export function VisibilidadLandingToggle({
  modeloId,
  visibleInicial,
  puedeSerPublico,
}: {
  modeloId: string;
  visibleInicial: boolean;
  puedeSerPublico: boolean;
}) {
  const [visible, setVisible] = useState(visibleInicial);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !visible;
    setVisible(next);
    startTransition(() => {
      toggleVisibilidadLandingAction(modeloId, next);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
      <div>
        <p className="text-sm font-medium text-zinc-800">Visible en landing</p>
        <p className="text-xs text-zinc-500">
          {puedeSerPublico ? "Aparece en la vitrina pública de talentos." : "Debe estar activo para publicarse."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        disabled={!puedeSerPublico || pending}
        onClick={handleToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          visible ? "bg-zinc-950" : "bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            visible ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
