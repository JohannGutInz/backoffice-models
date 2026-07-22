import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";
import { PublicarButton, CerrarButton, EliminarButton } from "@/components/convocatorias/ConvocatoriaActions";
import { getConvocatoria } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  OPEN: "Publicada",
  CLOSED: "Cerrada",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  OPEN: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-zinc-200 text-zinc-500",
};

export default async function ConvocatoriaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getConvocatoria(id);
  if (!conv) notFound();

  const isExpired = conv.status === "OPEN" && conv.fechaEvento < new Date();
  const statusLabel = isExpired ? "Vencida" : (STATUS_LABEL[conv.status] ?? conv.status);
  const statusClass = isExpired ? "bg-amber-50 text-amber-700" : (STATUS_CLASS[conv.status] ?? "");

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={conv.titulo}
        subtitle={`${conv.tipo} · ${conv.ciudad}`}
        actions={
          <div className="flex items-center gap-3">
            {conv.status !== "CLOSED" && (
              <LinkButton href={APP_ROUTE.app.convocatorias.edit(conv.id)} variant="secondary">
                <Pencil className="h-4 w-4" /> Editar
              </LinkButton>
            )}
            {conv.status === "DRAFT" && <PublicarButton id={conv.id} />}
            {conv.status === "OPEN" && <CerrarButton id={conv.id} />}
          </div>
        }
      />

      {/* Status banner */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
            {statusLabel}
          </span>
          {conv.publishedAt && (
            <span className="text-sm text-zinc-400">
              Publicada el{" "}
              {conv.publishedAt.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
        {conv.status === "DRAFT" && (
          <EliminarButton id={conv.id} />
        )}
      </div>

      {/* Main data */}
      <Card className="p-6 space-y-6">
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Fecha y lugar</h2>
          <FieldGrid>
            <Field
              label="Fecha del evento"
              value={conv.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            />
            <Field label="Horario" value={conv.horario} />
            <Field label="Lugar" value={conv.lugar} />
            <Field label="Ciudad" value={conv.ciudad} />
          </FieldGrid>
        </section>

        <hr className="border-zinc-100" />

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Detalles del trabajo</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-400">Funciones</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{conv.funciones}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">Perfil requerido</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{conv.perfil}</p>
            </div>
            <Field label="Pago" value={conv.pago} />
          </div>
        </section>

        {conv.cuerpo && (
          <>
            <hr className="border-zinc-100" />
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Notas adicionales</h2>
              <p className="whitespace-pre-wrap text-sm text-zinc-800">{conv.cuerpo}</p>
            </section>
          </>
        )}

        <hr className="border-zinc-100" />

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Contacto</h2>
          <Field label="WhatsApp" value={conv.whatsappNumber} />
        </section>
      </Card>

      <div className="text-xs text-zinc-400">
        Creada el{" "}
        {conv.createdAt.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
        {" · "}
        <Link href={APP_ROUTE.convocatorias.detail(conv.id)} className="underline hover:text-zinc-600" target="_blank">
          Ver página pública
        </Link>
      </div>
    </div>
  );
}
