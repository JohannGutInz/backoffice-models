"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface GalleryImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  modelId: string;
  label?: string;
}

export function GalleryImageUpload({ value, onChange, max, modelId, label = "Fotos" }: GalleryImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Ya alcanzaste el máximo de ${max} fotos.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("modelId", modelId);

        const res = await fetch("/api/upload/image", { method: "POST", body: formData });
        const uploadResult = await res.json();
        if (!res.ok) throw new Error(uploadResult.error ?? "Error al subir la imagen.");
        uploaded.push(uploadResult.url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-zinc-500">
        {label} <span className="text-zinc-400">({value.length}/{max})</span>
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
            <Image src={url} alt="Foto del book" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
            >
              Quitar
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
          >
            <span className="text-lg leading-none">+</span>
            {uploading ? "Subiendo…" : "Agregar foto"}
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
