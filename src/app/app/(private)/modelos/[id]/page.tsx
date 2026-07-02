import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, User, Pencil } from "lucide-react";
import { getModel } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

const SHIRT_SIZE_LABEL: Record<string, string> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
};

const PANTS_SCALE_LABEL: Record<string, string> = {
  MEN: "Hombre",
  WOMEN: "Mujer",
};

function yesNo(value: boolean): string {
  return value ? "Sí" : "No";
}

function calculateAgeFrom(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasNotHadBirthdayYet =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (hasNotHadBirthdayYet) age -= 1;
  return age;
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getModel(id);

  if (!model) notFound();

  return (
    <div>
      <Link
        href={APP_ROUTE.app.models.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Modelos
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={formatFullName(model)} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {formatFullName(model)}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {GENRE_LABEL[model.genre] ?? model.genre}
              </span>
              <span>·</span>
              <span>{calculateAgeFrom(model.birthDate)} años</span>
            </div>
          </div>
        </div>
        <LinkButton href={APP_ROUTE.app.models.edit.id(model.id)} variant="secondary">
          <Pencil className="h-4 w-4" /> Editar
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos personales" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Nombre completo" value={formatFullName(model)} />
                <Field
                  label="Fecha de nacimiento"
                  value={`${formatDate(model.birthDate)} · ${calculateAgeFrom(model.birthDate)} años`}
                />
                <Field label="Género" value={GENRE_LABEL[model.genre] ?? model.genre} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Atributos físicos" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Estatura" value={model.height ? `${model.height} cm` : "Sin definir"} />
                <Field label="Peso actual" value={model.currentWeight ? `${model.currentWeight} kg` : "Sin definir"} />
                <Field label="Tatuajes visibles" value={yesNo(model.hasVisibleTattoos)} />
                <Field label="Talla de camisa" value={model.shirtSize ? SHIRT_SIZE_LABEL[model.shirtSize] : "Sin definir"} />
                <Field
                  label="Talla de pantalón"
                  value={
                    model.pantsSizeScale && model.pantsSize
                      ? `${PANTS_SCALE_LABEL[model.pantsSizeScale]} · ${model.pantsSize}`
                      : "Sin definir"
                  }
                />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Logística" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Disponibilidad para viajar" value={yesNo(model.travelAvailability)} />
                <Field label="Pasaporte" value={yesNo(model.hasPassport)} />
                <Field label="Visa" value={yesNo(model.hasVisa)} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Contacto" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Correo
                    </span>
                  }
                  value={model.email}
                />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </span>
                  }
                  value={model.phone}
                />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Ubicación" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Municipio
                    </span>
                  }
                  value={model.city.name}
                />
                <Field label="Estado" value={model.city.state.name} />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" /> País
                    </span>
                  }
                  value={model.country.name}
                />
                <Field label="Nacionalidad" value={model.country.demonym} />
              </FieldGrid>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {model.categories.length > 0 && (
            <Card>
              <CardHeader title="Categorías" />
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {model.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {model.activities.length > 0 && (
            <Card>
              <CardHeader title="Actividades" />
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {model.activities.map((act) => (
                    <span
                      key={act.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700"
                    >
                      {act.name}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Identificación interna" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="ID" value={<span className="font-mono text-xs">{model.id}</span>} />
              </FieldGrid>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
