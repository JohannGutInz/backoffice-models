"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { updateOwnModelProfileAction } from "@/lib/actions";
import { ownModelProfileSchema, type OwnModelProfileData } from "@/lib/schemas";
import type { ModelWithRelations } from "@/lib/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ModelProfileForm({ model }: { model: ModelWithRelations }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnModelProfileData>({
    resolver: zodResolver(ownModelProfileSchema),
    defaultValues: { phone: model.phone, mainPhotoUrl: model.mainPhotoUrl ?? "" },
  });

  function handlePhotoSelected(file: File | null) {
    setPendingPhoto(file);
    setPhotoRemoved(file === null);
  }

  async function onSubmit(data: OwnModelProfileData) {
    setMessage(null);

    let mainPhotoUrl = model.mainPhotoUrl ?? "";

    if (pendingPhoto) {
      const formData = new FormData();
      formData.append("file", pendingPhoto);
      formData.append("modelId", model.id);

      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!res.ok) {
        setMessage(uploadResult.error ?? "Error al subir la imagen.");
        return;
      }
      mainPhotoUrl = uploadResult.url;
    } else if (photoRemoved) {
      mainPhotoUrl = "";
    }

    const result = await updateOwnModelProfileAction({ ...data, mainPhotoUrl });
    setMessage(result.message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Foto de perfil" />
        <div className="px-5 pb-5">
          <ImageUpload label="Foto principal" value={model.mainPhotoUrl ?? undefined} onFileSelected={handlePhotoSelected} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="space-y-4 px-5 pb-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Nombre completo</label>
            <input
              disabled
              value={model.fullName}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Correo</label>
            <input
              disabled
              value={model.email}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Teléfono</label>
            <input
              {...register("phone")}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
          </div>
        </div>
      </Card>

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
