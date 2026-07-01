"use client";

import { useState, useTransition } from "react";
import { toggleLandingVisibilityAction } from "@/lib/actions";
import { Switch } from "@/components/ui/Switch";

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
      <Switch checked={visible} onChange={handleToggle} disabled={!canBePublic || pending} />
    </div>
  );
}
