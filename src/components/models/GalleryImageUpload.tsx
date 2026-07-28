"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { ImageCropModal } from "./ImageCropModal";

interface GalleryImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  modelId?: string;
  label?: string;
  aspect?: number;
}

export interface GalleryImageUploadHandle {
  resolvePending(urls: string[]): Promise<string[]>;
}

export const GalleryImageUpload = forwardRef<GalleryImageUploadHandle, GalleryImageUploadProps>(
  function GalleryImageUpload({ value, onChange, max, modelId, label = "Fotos", aspect = 3 / 4 }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingFiles = useRef(new Map<string, File>());
    const [error, setError] = useState<string | null>(null);

    // Crop modal state
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const pendingRawFile = useRef<File | null>(null);

    useImperativeHandle(ref, () => ({
      async resolvePending(urls: string[]) {
        const resolved = await Promise.all(
          urls.map(async (url) => {
            const file = pendingFiles.current.get(url);
            if (!file) return url;

            const formData = new FormData();
            formData.append("file", file);
            if (modelId) formData.append("modelId", modelId);

            const res = await fetch("/api/upload/image", { method: "POST", body: formData });
            const uploadResult = await res.json();
            if (!res.ok) throw new Error(uploadResult.error ?? "Error al subir la imagen.");

            URL.revokeObjectURL(url);
            pendingFiles.current.delete(url);
            return uploadResult.url as string;
          }),
        );
        return resolved;
      },
    }));

    function handleFiles(files: FileList | null) {
      if (!files || files.length === 0) return;
      setError(null);

      const remaining = max - value.length;
      if (remaining <= 0) {
        setError(`Ya alcanzaste el máximo de ${max} fotos.`);
        return;
      }

      // Open crop editor for first file; queue the rest for sequential editing
      const file = files[0];
      pendingRawFile.current = file;
      const objectUrl = URL.createObjectURL(file);
      setCropSrc(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }

    function handleCropConfirm(blob: Blob, previewUrl: string) {
      const rawFile = pendingRawFile.current;
      if (!rawFile) return;

      const croppedFile = new File([blob], rawFile.name, { type: "image/webp" });
      pendingFiles.current.set(previewUrl, croppedFile);
      onChange([...value, previewUrl]);

      // Clean up the original object URL
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
      pendingRawFile.current = null;
    }

    function handleCropCancel() {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
      pendingRawFile.current = null;
    }

    function handleRemove(url: string) {
      if (pendingFiles.current.has(url)) {
        URL.revokeObjectURL(url);
        pendingFiles.current.delete(url);
      }
      onChange(value.filter((u) => u !== url));
    }

    return (
      <>
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
                  aria-label="Quitar foto"
                  className="absolute top-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-rose-600 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <span className="text-lg leading-none" aria-hidden>×</span>
                </button>
              </div>
            ))}

            {value.length < max && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
              >
                <span className="text-lg leading-none">+</span>
                Agregar foto
              </button>
            )}
          </div>

          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {cropSrc && (
          <ImageCropModal
            src={cropSrc}
            aspect={aspect}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </>
    );
  },
);
