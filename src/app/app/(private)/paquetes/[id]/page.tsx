import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getPaquete, getCurrentUser, listModels } from "@/lib/data";
import { cambiarStatusPaqueteAction } from "@/lib/actions";
import { Card, CardHeader } from "@/components/ui/Card";
import { PaqueteModelosManager } from "@/components/paquetes/PaqueteModelosManager";
import { CopyLinkButton } from "@/components/paquetes/CopyLinkButton";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  CLOSED: "Cerrado",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  SENT: "bg-blue-50 text-blue-700",
  CLOSED: "bg-zinc-200 text-zinc-500",
};

const NEXT_STATUS: Record<string, { label: string; value: "DRAFT" | "SENT" | "CLOSED"; class: string } | null> = {
  DRAFT: { label: "Marcar como enviado", value: "SENT", class: "bg-blue-600 text-white hover:bg-blue-700" },
  SENT: { label: "Cerrar propuesta", value: "CLOSED", class: "bg-zinc-800 text-white hover:bg-zinc-700" },
  CLOSED: null,
};

export default async function PaqueteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await getCurrentUser();

  const [paquete, todosLosModelos] = await Promise.all([
    getPaquete(id),
    listModels(),
  ]);

  if (!paquete) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/paquetes/${paquete.token}`;
  const nextStatus = NEXT_STATUS[paquete.status];

  return (
    <div>
      <Link
        href={APP_ROUTE.app.packages.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Paquetes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{paquete.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[paquete.status] ?? ""}`}>
              {STATUS_LABEL[paquete.status] ?? paquete.status}
            </span>
          </div>
          {paquete.description && (
            <p className="mt-1 max-w-xl text-sm text-zinc-500">{paquete.description}</p>
          )}
          <p className="mt-1 text-xs text-zinc-400">Creado el {formatDate(paquete.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={publicUrl} />
          <Link
            href={`/paquetes/${paquete.token}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <ExternalLink className="h-4 w-4" /> Ver público
          </Link>
          {nextStatus && (
            <form>
              <button
                formAction={cambiarStatusPaqueteAction.bind(null, paquete.id, nextStatus.value)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${nextStatus.class}`}
              >
                {nextStatus.label}
              </button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader title={`Modelos en este paquete (${paquete.models.length})`} />
        <div className="px-5 pb-5">
          <PaqueteModelosManager
            paqueteId={paquete.id}
            modelosEnPaquete={paquete.models}
            todosLosModelos={todosLosModelos}
          />
        </div>
      </Card>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Link público del paquete</p>
        <p className="font-mono text-sm text-zinc-700 break-all">{publicUrl}</p>
        <p className="mt-1 text-xs text-zinc-400">
          Cualquier persona con este link puede ver los modelos de esta propuesta.
        </p>
      </div>
    </div>
  );
}
