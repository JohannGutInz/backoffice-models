import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Camera, Lock, Pencil, ShieldAlert, Star } from "lucide-react";
import { getModelo } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { EstadoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { calcularEdad, formatCurrency, formatDate } from "@/lib/utils";

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
      <Link href="/modelos" className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
        <ArrowLeft className="h-4 w-4" /> Volver a Modelos
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={modelo.nombreArtistico} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{modelo.nombreArtistico}</h1>
              {modelo.destacado && <Star className="h-5 w-5 fill-gold-400 text-gold-400" />}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span>{modelo.numeroModelo}</span>
              <span>·</span>
              <EstadoBadge estado={modelo.estado} />
              <span>·</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {CATEGORIA_LABEL[modelo.categoria]}
              </span>
            </div>
          </div>
        </div>
        <Button variant="secondary">
          <Pencil className="h-4 w-4" /> Editar perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Identidad" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Nombre artístico (público)" value={modelo.nombreArtistico} />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Nombre legal
                    </span>
                  }
                  value={modelo.nombreLegal}
                />
                <Field label="Fecha de nacimiento" value={`${formatDate(modelo.fechaNacimiento)} · ${calcularEdad(modelo.fechaNacimiento)} años`} />
                <Field label="Género" value={modelo.genero} />
                <Field label="Nacionalidad" value={modelo.nacionalidad} />
                <Field label="Número de modelo" value={modelo.numeroModelo} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Contacto"
              subtitle="Privado — nunca se expone en la landing pública"
              action={<Lock className="h-4 w-4 text-zinc-300" />}
            />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Correo" value={modelo.contacto.correo} />
                <Field label="Teléfono" value={modelo.contacto.telefono} />
                <Field label="Ubicación" value={modelo.contacto.ubicacion} />
                <Field label="Redes" value={modelo.contacto.redes} />
              </FieldGrid>
            </div>
          </Card>

          {modelo.fisico && (
            <Card>
              <CardHeader title="Características físicas" subtitle="Alimentan los filtros de la vitrina pública" />
              <div className="px-5 pb-5">
                <FieldGrid>
                  <Field label="Estatura" value={modelo.fisico.estaturaCm ? `${modelo.fisico.estaturaCm} cm` : undefined} />
                  <Field label="Medidas" value={modelo.fisico.medidas} />
                  <Field label="Tallas" value={modelo.fisico.tallas} />
                  <Field label="Color de cabello" value={modelo.fisico.colorCabello} />
                  <Field label="Color de ojos" value={modelo.fisico.colorOjos} />
                  <Field label="Tono de piel" value={modelo.fisico.tonoPiel} />
                </FieldGrid>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Categorización" />
            <div className="px-5 pb-5 space-y-4">
              <FieldGrid>
                <Field label="Categoría" value={CATEGORIA_LABEL[modelo.categoria]} />
                <Field label="Nivel de experiencia" value={modelo.nivelExperiencia} />
              </FieldGrid>
              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-400">Etiquetas / habilidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {modelo.etiquetas.map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Material visual" subtitle="Referencias a object storage — URLs firmadas y temporales" />
            <div className="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px]">Sin material</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Operativo" subtitle="Solo visible en backoffice" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Estado" value={<EstadoBadge estado={modelo.estado} />} />
                <Field label="Disponibilidad" value={<EstadoBadge estado={modelo.disponibilidad.replace(" ", "_")} />} />
                <Field label="Destacado" value={modelo.destacado ? "Sí" : "No"} />
                <Field label="Tarifa base" value={formatCurrency(modelo.tarifaBase)} />
              </FieldGrid>
              {modelo.notasInternas && (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="mb-1 font-medium">Notas internas</p>
                  <p>{modelo.notasInternas}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Legal" />
            <div className="px-5 pb-5">
              {modelo.consentimiento?.aceptado ? (
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> Uso de imagen aceptado
                  </p>
                  <dl className="mt-2 space-y-1 text-xs text-emerald-700/80">
                    <div className="flex justify-between">
                      <dt>Fecha</dt>
                      <dd>{formatDate(modelo.consentimiento.fecha)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Versión documento</dt>
                      <dd>{modelo.consentimiento.versionDocumento}</dd>
                    </div>
                    <div className="flex justify-between text-right">
                      <dt>Alcance</dt>
                      <dd className="max-w-[60%]">{modelo.consentimiento.alcance}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">
                  <ShieldAlert className="h-4 w-4" /> Sin consentimiento de uso de imagen registrado
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
