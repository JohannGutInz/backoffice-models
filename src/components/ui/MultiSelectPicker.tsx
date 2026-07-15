"use client";

import { useState } from "react";
import { Select } from "./Select";
import { Button } from "./Button";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectPickerProps {
  label: string;
  hint?: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  placeholder?: string;
}

export function MultiSelectPicker({
  label,
  hint,
  options,
  selectedIds,
  onChange,
  error,
  placeholder = "Selecciona una opción…",
}: MultiSelectPickerProps) {
  const [pickerId, setPickerId] = useState("");
  const picked = options.filter((o) => selectedIds.includes(o.id));

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {hint && <span className="text-zinc-400 font-normal">{hint}</span>}
      </label>
      <div className="flex gap-2">
        <Select
          value={pickerId}
          onChange={(e) => setPickerId(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        >
          {options
            .filter((o) => !selectedIds.includes(o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
        </Select>
        <Button
          variant="secondary"
          type="button"
          disabled={!pickerId}
          onClick={() => {
            if (pickerId) {
              onChange([...selectedIds, pickerId]);
              setPickerId("");
            }
          }}
        >
          + Agregar
        </Button>
      </div>
      {picked.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {picked.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
            >
              {item.name}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== item.id))}
                className="ml-0.5 text-zinc-400 hover:text-zinc-700"
                aria-label={`Quitar ${item.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
