"use client";

import { useState, useTransition } from "react";
import { toggleLandingVisibilityAction } from "@/lib/actions";

export function LandingVisibilityToggle({
  modelId,
  initialVisible,
  canBePublic,
}: {
  modelId: string;
  initialVisible: boolean;
  canBePublic: boolean;
}) {
  const [visible, setVisible] = useState(initialVisible);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !visible;
    setVisible(next);
    startTransition(() => {
      toggleLandingVisibilityAction(modelId, next);
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
      <div>
        <p className="text-sm font-medium text-zinc-800">Visible en landing</p>
        <p className="text-xs text-zinc-500">
          {canBePublic ? "Aparece en la vitrina pública de talentos." : "Debe estar activo para publicarse."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        disabled={!canBePublic || pending}
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
