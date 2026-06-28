import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";
import { getModelo } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

function calcularEdadDesde(fecha: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < fecha.getMonth() ||
    (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
  if (aunNoCumple) edad -= 1;
  return edad;
}

export default async function ModeloDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modelo = await getModelo(id);

  if (!modelo) notFound();

  return (
    <div>
      <Link
        href={APP_ROUTE.app.modelos.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Modelos
      </Link>

      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={modelo.fullName} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {modelo.fullName}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {GENRE_LABEL[modelo.genre] ?? modelo.genre}
              </span>
              <span>·</span>
              <span>{calcularEdadDesde(modelo.birthDate)} años</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos personales" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Nombre completo" value={modelo.fullName} />
                <Field
                  label="Fecha de nacimiento"
                  value={`${formatDate(modelo.birthDate)} · ${calcularEdadDesde(modelo.birthDate)} años`}
                />
                <Field label="Género" value={GENRE_LABEL[modelo.genre] ?? modelo.genre} />
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
                  value={modelo.email}
                />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </span>
                  }
                  value={modelo.phone}
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
                  value={modelo.city.name}
                />
                <Field label="Estado" value={modelo.city.state.name} />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" /> País
                    </span>
                  }
                  value={modelo.country.name}
                />
                <Field label="Nacionalidad" value={modelo.country.demonym} />
              </FieldGrid>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {modelo.categories.length > 0 && (
            <Card>
              <CardHeader title="Categorías" />
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {modelo.categories.map((cat) => (
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

          <Card>
            <CardHeader title="Identificación interna" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="ID" value={<span className="font-mono text-xs">{modelo.id}</span>} />
              </FieldGrid>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
