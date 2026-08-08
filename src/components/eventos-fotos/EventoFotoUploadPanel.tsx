"use client";

import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { ImageCropModal } from "@/components/models/ImageCropModal";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { crearEventoFotoAction } from "@/lib/actions";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

interface PendingCrop {
  blob: Blob;
  previewUrl: string;
  fileName: string;
}

// Sequential wizard: pick one or many files → crop each to 3:4 → alt text is
// required per photo → upload → save as an unpublished draft. Deliberately
// one-at-a-time (crop UI is full-screen) rather than a staged multi-preview
// grid like GalleryImageUpload — that component defers upload for a single
// profile-save step; here each photo is its own independent record, saved
// the moment its alt text is confirmed.
export function EventoFotoUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<File[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);
  const [altValue, setAltValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingInQueue, setRemainingInQueue] = useState(0);

  function processNext() {
    const next = queueRef.current.shift();
    setRemainingInQueue(queueRef.current.length);
    if (!next) return;

    if (!ALLOWED_TYPES.has(next.type)) {
      setError(`"${next.name}" no es un tipo de imagen permitido.`);
      processNext();
      return;
    }

    setCropSrc(URL.createObjectURL(next));
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    queueRef.current.push(...Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
    if (!cropSrc && !pendingCrop) processNext();
  }

  function handleCropConfirm(blob: Blob, previewUrl: string) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingCrop({ blob, previewUrl, fileName: `evento-${Date.now()}.webp` });
    setAltValue("");
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    processNext();
  }

  function discardPendingCrop() {
    if (pendingCrop) URL.revokeObjectURL(pendingCrop.previewUrl);
    setPendingCrop(null);
    setAltValue("");
    processNext();
  }

  // Clears everything still queued behind the photo currently being
  // cropped/described — that one isn't interrupted, it can still be
  // finished or discarded on its own.
  function cancelQueue() {
    queueRef.current = [];
    setRemainingInQueue(0);
  }

  // Minimal manual focus trap for the alt dialog: Escape discards the
  // current photo, Tab/Shift+Tab cycle within the dialog instead of
  // escaping to the page behind it.
  function handleDialogKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      discardPendingCrop();
      return;
    }

    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  async function handleSave() {
    if (!pendingCrop) return;
    const trimmedAlt = altValue.trim();
    if (!trimmedAlt) {
      setError("El texto alternativo es obligatorio.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const file = new File([pendingCrop.blob], pendingCrop.fileName, { type: "image/webp" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/evento-image", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!res.ok) throw new Error(uploadResult.error ?? "Error al subir la imagen.");

      const result = await crearEventoFotoAction({ url: uploadResult.url, alt: trimmedAlt });
      if (result.status === "error") throw new Error(result.message);

      URL.revokeObjectURL(pendingCrop.previewUrl);
      setPendingCrop(null);
      setAltValue("");
      startTransition(() => {
        processNext();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Agregar fotos"
        subtitle="Se guardan como borrador sin publicar — revisa y publica desde la tabla."
      />
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 py-8 text-sm text-zinc-500 transition hover:border-zinc-400 hover:bg-zinc-100"
        >
          <UploadCloud className="h-6 w-6" />
          Seleccionar fotos (una o varias)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      </div>

      {/* Fixed + higher z-index than the crop modal and alt dialog below (both
          z-50, full-screen) — the queue is almost always in progress *during*
          one of those, so this needs to sit above them to actually be
          reachable, not just in the card underneath. */}
      {remainingInQueue > 0 && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-3 rounded-lg bg-zinc-900 px-4 py-2.5 text-xs text-white shadow-lg">
          <span>{remainingInQueue} foto(s) más en la cola.</span>
          <button
            type="button"
            onClick={cancelQueue}
            className="font-medium text-rose-300 hover:text-rose-200"
          >
            Cancelar lote
          </button>
        </div>
      )}

      {cropSrc && (
        <ImageCropModal src={cropSrc} aspect={3 / 4} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}

      {pendingCrop && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Texto alternativo de la foto"
          onKeyDown={handleDialogKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-900">Describe la foto</h3>
              <button
                type="button"
                onClick={discardPendingCrop}
                aria-label="Descartar foto"
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-100">
              <Image src={pendingCrop.previewUrl} alt="" fill className="object-cover" unoptimized />
            </div>

            <Input
              label="Texto alternativo"
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="Ej. Modelos en pasarela, evento Vogue Studio 2026"
              disabled={uploading}
              autoFocus
            />
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={discardPendingCrop} disabled={uploading}>
                Descartar
              </Button>
              <Button type="button" onClick={handleSave} disabled={uploading}>
                {uploading ? "Subiendo…" : "Guardar como borrador"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
