"use client";

import { useRef, useState } from "react";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  modelId?: string;
}

export function VideoUpload({ value, onChange, label = "Video", className, modelId }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const presignRes = await fetch("/api/upload/video-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
          modelId,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.error ?? "Error al obtener URL");

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

      onChange(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el video");
    } finally {
      setUploading(false);
      setProgress(0);
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
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
      >
        {value ? (
          <video src={value} controls className="w-full rounded-md" />
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">
              {uploading ? `Subiendo… ${progress}%` : "Arrastra o haz clic para subir"}
            </p>
            <p className="text-xs text-zinc-400">MP4, MOV, WebM · máx 500 MB</p>
          </>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80">
            <div className="h-1.5 w-3/4 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-800 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-600">{progress}%</p>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1.5 text-xs text-zinc-400 underline hover:text-red-500"
        >
          Eliminar video
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
