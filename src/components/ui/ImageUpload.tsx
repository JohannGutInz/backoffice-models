"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  modelId?: string;
}

export function ImageUpload({ value, onChange, label = "Imagen", className, modelId }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (modelId) formData.append("modelId", modelId);

      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Error al subir");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-zinc-500">{label}</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
      >
        {value ? (
          <div className="relative h-40 w-full overflow-hidden rounded-md">
            <Image src={value} alt="preview" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">
              {uploading ? "Subiendo…" : "Arrastra o haz clic para subir"}
            </p>
            <p className="text-xs text-zinc-400">JPG, PNG, WebP · máx 10 MB</p>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1.5 text-xs text-zinc-400 underline hover:text-red-500"
        >
          Eliminar imagen
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
