"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onFileSelected: (file: File | null) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onFileSelected, label = "Imagen", className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function pickFile(file: File) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setRemoved(false);
    onFileSelected(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  function handleRemove() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setRemoved(true);
    onFileSelected(null);
  }

  const displayUrl = localPreview ?? (removed ? undefined : value);

  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-zinc-500">{label}</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
      >
        {displayUrl ? (
          <div className="relative h-40 w-full overflow-hidden rounded-md">
            <Image src={displayUrl} alt="preview" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">Arrastra o haz clic para subir</p>
            <p className="text-xs text-zinc-400">JPG, PNG, WebP · máx 10 MB</p>
          </>
        )}
      </div>

      {displayUrl && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-1.5 text-xs text-zinc-400 underline hover:text-red-500"
        >
          Eliminar imagen
        </button>
      )}

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
