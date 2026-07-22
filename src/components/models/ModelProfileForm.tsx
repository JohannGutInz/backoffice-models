"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera, MapPin, User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { GalleryImageUpload } from "@/components/models/GalleryImageUpload";
import { GalleryVideoUpload } from "@/components/models/GalleryVideoUpload";
import { updateOwnModelProfileAction } from "@/lib/actions";
import { ownModelProfileSchema, type OwnModelProfileData } from "@/lib/schemas";
import type { OwnModelWithKyc } from "@/lib/data";
import { getMainPhotoUrl, getGalleryPhotos, getGalleryVideos } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const MAX_PHOTOS = 5;
const MAX_VIDEOS = 3;

const KYC_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En revisión", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rechazado", className: "bg-rose-50 text-rose-700 border-rose-200" },
  REQUIRES_CHANGES: { label: "Requiere cambios", className: "bg-gold-50 text-gold-700 border-gold-200" },
};

interface Activity {
  id: string;
  name: string;
}

export function ModelProfileForm({
  model,
  activities,
}: {
  model: NonNullable<OwnModelWithKyc>;
  activities: Activity[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const mainPhotoUrl = getMainPhotoUrl(model.assets);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OwnModelProfileData>({
    resolver: zodResolver(ownModelProfileSchema),
    defaultValues: {
      firstName: model.firstName,
      paternalLastName: model.paternalLastName,
      maternalLastName: model.maternalLastName ?? "",
      phone: model.phone,
      mainPhotoUrl: mainPhotoUrl ?? "",
      photoUrls: getGalleryPhotos(model.assets),
      videoUrls: getGalleryVideos(model.assets),
      height: model.height ?? undefined,
      currentWeight: model.currentWeight ?? undefined,
      hasVisibleTattoos: model.hasVisibleTattoos,
      shirtSize: model.shirtSize ?? undefined,
      pantsSizeScale: model.pantsSizeScale ?? undefined,
      pantsSize: model.pantsSize ?? "",
      travelAvailability: model.travelAvailability,
      hasPassport: model.hasPassport,
      hasVisa: model.hasVisa,
      activityIds: model.activities.map((a) => a.id),
    },
  });

  const firstName = watch("firstName");
  const paternalLastName = watch("paternalLastName");
  const activityIds = watch("activityIds");
  const photoUrls = watch("photoUrls");
  const videoUrls = watch("videoUrls");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setPendingPhoto(file);
    setPhotoRemoved(false);
    e.target.value = "";
  }

  function handleAvatarRemove() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setPendingPhoto(null);
    setPhotoRemoved(true);
  }

  const displayAvatar = avatarPreview ?? (photoRemoved ? null : mainPhotoUrl);
  const kycBadge = KYC_BADGE[model.kyc.status] ?? KYC_BADGE.PENDING;

  async function onSubmit(data: OwnModelProfileData) {
    if (model.kyc.status === "APPROVED") {
      const confirmed = window.confirm(
        "Tu KYC ya está aprobado. Si guardas estos cambios, tu perfil deberá aprobarse de nuevo. ¿Deseas continuar?",
      );
      if (!confirmed) return;
    }

    setMessage(null);

    let newMainPhotoUrl = mainPhotoUrl ?? "";

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
      newMainPhotoUrl = uploadResult.url;
    } else if (photoRemoved) {
      newMainPhotoUrl = "";
    }

    const result = await updateOwnModelProfileAction({ ...data, mainPhotoUrl: newMainPhotoUrl });
    setMessage(result.message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Profile hero ── */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />

        {/* Avatar + info */}
        <div className="relative -mt-14 flex flex-col items-center px-6 pb-8">
          {/* Circular avatar with edit overlay */}
          <div className="group relative">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-lg transition"
            >
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Foto de perfil" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {displayAvatar && (
            <button
              type="button"
              onClick={handleAvatarRemove}
              className="mt-1.5 text-xs text-zinc-400 underline hover:text-rose-500"
            >
              Eliminar foto
            </button>
          )}

          {/* Name */}
          <h2 className="mt-3 text-xl font-semibold text-zinc-900">
            {(firstName || model.firstName)} {(paternalLastName || model.paternalLastName)}
          </h2>
          <p className="text-sm text-zinc-400">{model.email}</p>

          {/* City */}
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5" />
            {model.city.name}, {model.country.name}
          </p>

          {/* Chips row */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${kycBadge.className}`}>
              {kycBadge.label}
            </span>
            {model.height && (
              <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
                {model.height} cm
              </span>
            )}
            {model.currentWeight && (
              <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
                {model.currentWeight} kg
              </span>
            )}
            <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
              {model.genre === "FEMALE" ? "Mujer" : "Hombre"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Book ── */}
      <Card>
        <CardHeader title="Book" subtitle="Hasta 5 fotos para tu portfolio público." />
        <div className="px-5 pb-5">
          <Controller
            name="photoUrls"
            control={control}
            render={() => (
              <GalleryImageUpload
                value={photoUrls}
                onChange={(urls) => setValue("photoUrls", urls, { shouldValidate: true })}
                max={MAX_PHOTOS}
                modelId={model.id}
              />
            )}
          />
          {errors.photoUrls && <p className="mt-1.5 text-xs text-red-500">{errors.photoUrls.message}</p>}
        </div>
      </Card>

      {/* ── Videos ── */}
      <Card>
        <CardHeader title="Videos" subtitle="Hasta 3 videos para tu portfolio." />
        <div className="px-5 pb-5">
          <Controller
            name="videoUrls"
            control={control}
            render={() => (
              <GalleryVideoUpload
                value={videoUrls}
                onChange={(urls) => setValue("videoUrls", urls, { shouldValidate: true })}
                max={MAX_VIDEOS}
                modelId={model.id}
              />
            )}
          />
          {errors.videoUrls && <p className="mt-1.5 text-xs text-red-500">{errors.videoUrls.message}</p>}
        </div>
      </Card>

      {/* ── Datos de contacto ── */}
      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input label="Nombre(s)" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Apellido paterno" {...register("paternalLastName")} error={errors.paternalLastName?.message} />
          <Input label="Apellido materno" {...register("maternalLastName")} error={errors.maternalLastName?.message} />
          <Input label="Correo" disabled value={model.email} />
          <div className="sm:col-span-2">
            <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
          </div>
        </div>
      </Card>

      {/* ── Atributos físicos ── */}
      <Card>
        <CardHeader title="Atributos físicos" subtitle="Necesarios para que tu perfil entre a revisión." />
        <div className="grid grid-cols-2 gap-4 px-5 pb-5 sm:grid-cols-3">
          <Input
            type="number"
            label="Estatura (cm)"
            {...register("height", { valueAsNumber: true })}
            error={errors.height?.message}
          />
          <Input
            type="number"
            label="Peso actual (kg)"
            {...register("currentWeight", { valueAsNumber: true })}
            error={errors.currentWeight?.message}
          />
          <div className="hidden sm:block" />
          <Select
            label="Talla de camisa"
            {...register("shirtSize")}
            defaultValue={model.shirtSize ?? ""}
            placeholder="Selecciona…"
            error={errors.shirtSize?.message}
          >
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            label="Escala pantalón"
            {...register("pantsSizeScale")}
            defaultValue={model.pantsSizeScale ?? ""}
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
          </Select>
          <Input label="Talla de pantalón" {...register("pantsSize")} error={errors.pantsSize?.message} />
          <div className="col-span-2 sm:col-span-3">
            <Checkbox label="¿Tienes tatuajes visibles?" {...register("hasVisibleTattoos")} />
          </div>
        </div>
      </Card>

      {/* ── Disponibilidad ── */}
      <Card>
        <CardHeader title="Disponibilidad" />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
          <Checkbox label="Disponible para viajar" {...register("travelAvailability")} />
          <Checkbox label="Tengo pasaporte" {...register("hasPassport")} />
          <Checkbox label="Tengo visa" {...register("hasVisa")} />
        </div>
      </Card>

      {/* ── Actividades ── */}
      <Card>
        <CardHeader title="Actividades" />
        <div className="px-5 pb-5">
          <Controller
            name="activityIds"
            control={control}
            render={() => (
              <MultiSelectPicker
                label="Actividades"
                hint="(mínimo 1)"
                options={activities}
                selectedIds={activityIds}
                onChange={(ids) => setValue("activityIds", ids)}
                error={errors.activityIds?.message}
              />
            )}
          />
        </div>
      </Card>

      {message && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}

      <div className="flex justify-end pb-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
