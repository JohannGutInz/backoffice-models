"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
          <Input label="Nombre completo" disabled value={model.fullName} />
          <Input label="Correo" disabled value={model.email} />
          <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
        </div>
      </Card>

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
