"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { updateOwnModelProfileAction } from "@/lib/actions";
import { ownModelProfileSchema, type OwnModelProfileData } from "@/lib/schemas";
import type { OwnModelWithKyc } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
      mainPhotoUrl: model.mainPhotoUrl ?? "",
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

  const activityIds = watch("activityIds");

  function handlePhotoSelected(file: File | null) {
    setPendingPhoto(file);
    setPhotoRemoved(file === null);
  }

  async function onSubmit(data: OwnModelProfileData) {
    if (model.kyc.status === "APPROVED") {
      const confirmed = window.confirm(
        "Tu KYC ya está aprobado. Si guardas estos cambios, tu perfil deberá aprobarse de nuevo. ¿Deseas continuar?",
      );
      if (!confirmed) return;
    }

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
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input label="Nombre(s)" {...register("firstName")} error={errors.firstName?.message} />
          <Input
            label="Apellido paterno"
            {...register("paternalLastName")}
            error={errors.paternalLastName?.message}
          />
          <Input
            label="Apellido materno"
            {...register("maternalLastName")}
            error={errors.maternalLastName?.message}
          />
          <Input label="Correo" disabled value={model.email} />
          <div className="sm:col-span-2">
            <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Atributos físicos" subtitle="Necesarios para que tu perfil entre a revisión." />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
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
          <Select
            label="Talla de camisa"
            {...register("shirtSize")}
            defaultValue={model.shirtSize ?? ""}
            placeholder="Selecciona…"
            error={errors.shirtSize?.message}
          >
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </Select>
          <div />
          <Select
            label="Escala de talla de pantalón"
            {...register("pantsSizeScale")}
            defaultValue={model.pantsSizeScale ?? ""}
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
          </Select>
          <Input label="Talla de pantalón" {...register("pantsSize")} error={errors.pantsSize?.message} />
          <div className="sm:col-span-2">
            <Checkbox label="¿Tienes tatuajes visibles?" {...register("hasVisibleTattoos")} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Logística" />
        <div className="space-y-3 px-5 pb-5">
          <Checkbox label="Disponibilidad para viajar" {...register("travelAvailability")} />
          <Checkbox label="¿Cuentas con pasaporte?" {...register("hasPassport")} />
          <Checkbox label="¿Cuentas con visa?" {...register("hasVisa")} />
        </div>
      </Card>

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

      {message && <p className="text-sm text-zinc-600">{message}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
