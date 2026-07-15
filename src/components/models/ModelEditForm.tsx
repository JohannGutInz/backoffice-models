"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { updateModelAttributesAction } from "@/lib/actions";
import { modelEditSchema, type ModelEditData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";
import type { ModelWithRelations } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PantsSizeScale, ShirtSize } from "@/generated/prisma/enums";

interface Option {
  id: string;
  name: string;
}

export function ModelEditForm({
  model,
  categories,
  activities,
}: {
  model: ModelWithRelations;
  categories: Option[];
  activities: Option[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModelEditData>({
    resolver: zodResolver(modelEditSchema),
    defaultValues: {
      firstName: model.firstName,
      paternalLastName: model.paternalLastName,
      maternalLastName: model.maternalLastName ?? "",
      phone: model.phone,
      height: model.height ?? undefined,
      currentWeight: model.currentWeight ?? undefined,
      hasVisibleTattoos: model.hasVisibleTattoos,
      shirtSize: model.shirtSize ?? undefined,
      pantsSizeScale: model.pantsSizeScale ?? undefined,
      pantsSize: model.pantsSize ?? "",
      travelAvailability: model.travelAvailability,
      hasPassport: model.hasPassport,
      hasVisa: model.hasVisa,
      categoryIds: model.categories.map((c) => c.id),
      activityIds: model.activities.map((a) => a.id),
    },
  });

  const categoryIds = watch("categoryIds");
  const activityIds = watch("activityIds");

  async function onSubmit(data: ModelEditData) {
    setServerError(null);
    const result = await updateModelAttributesAction(model.id, data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    router.push(`${APP_ROUTE.app.models.index}/${model.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Identidad" />
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
          <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Atributos físicos" />
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
            {Object.entries(ShirtSize).map((size) => <option key={size[0]} value={size[0]}>{size[1]}</option>)}
          </Select>
          <div />
          <Select
            label="Escala de talla de pantalón"
            {...register("pantsSizeScale")}
            defaultValue={model.pantsSizeScale ?? ""}
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value={PantsSizeScale.MEN}>Hombre</option>
            <option value={PantsSizeScale.WOMEN}>Mujer</option>
          </Select>
          <Input label="Talla de pantalón" {...register("pantsSize")} error={errors.pantsSize?.message} />
          <div className="sm:col-span-2">
            <Checkbox label="¿Tiene tatuajes visibles?" {...register("hasVisibleTattoos")} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Logística" />
        <div className="space-y-3 px-5 pb-5">
          <Checkbox label="Disponibilidad para viajar" {...register("travelAvailability")} />
          <Checkbox label="¿Cuenta con pasaporte?" {...register("hasPassport")} />
          <Checkbox label="¿Cuenta con visa?" {...register("hasVisa")} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Categorías y actividades" />
        <div className="space-y-4 px-5 pb-5">
          <Controller
            name="categoryIds"
            control={control}
            render={() => (
              <MultiSelectPicker
                label="Categorías"
                hint="(mínimo 1)"
                options={categories}
                selectedIds={categoryIds}
                onChange={(ids) => setValue("categoryIds", ids)}
                error={errors.categoryIds?.message}
              />
            )}
          />
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

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
