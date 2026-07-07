"use client";

import { useRef, useState } from "react";

interface GalleryVideoUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max: number;
  modelId: string;
  label?: string;
}

export function GalleryVideoUpload({ value, onChange, max, modelId, label = "Videos" }: GalleryVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<string> {
    const presignRes = await fetch("/api/upload/video-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size, modelId }),
    });
    const presignData = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignData.error ?? "Error al obtener URL de carga.");

    const { uploadUrl, objectUrl } = presignData as { uploadUrl: string; objectUrl: string };

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
      xhr.onerror = () => reject(new Error("Error de red"));
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    return objectUrl;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Ya alcanzaste el máximo de ${max} videos.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        setProgress(0);
        uploaded.push(await uploadOne(file));
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el video.");
    } finally {
      setUploading(false);
      setProgress(0);
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

      <div className="space-y-3">
        {value.map((url) => (
          <div key={url}>
            <video src={url} controls className="w-full rounded-md" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="mt-1.5 text-xs text-zinc-400 underline hover:text-red-500"
            >
              Eliminar video
            </button>
          </div>
        ))}

        {value.length < max && (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
          >
            <p className="text-sm text-zinc-500">{uploading ? `Subiendo… ${progress}%` : "Haz clic para subir un video"}</p>
            <p className="text-xs text-zinc-400">MP4, MOV, WebM · máx 500 MB</p>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
