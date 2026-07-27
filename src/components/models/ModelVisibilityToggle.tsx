"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/Switch";
import { toggleModelVisibilityAction } from "@/lib/actions";

export function ModelVisibilityToggle({
  modelId,
  hiddenFromCatalog,
}: {
  modelId: string;
  hiddenFromCatalog: boolean;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(hiddenFromCatalog);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange() {
    const next = !hidden;
    setHidden(next);
    setIsSaving(true);
    const result = await toggleModelVisibilityAction(modelId, next);
    setIsSaving(false);
    if (result.status === "error") {
      setHidden(!next);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Switch checked={!hidden} onChange={handleChange} disabled={isSaving} size="sm" aria-label="Visible en el catálogo público" />
      <span className="text-xs font-medium text-zinc-500">
        {hidden ? "Oculto del catálogo" : "Visible en el catálogo"}
      </span>
    </div>
  );
}
