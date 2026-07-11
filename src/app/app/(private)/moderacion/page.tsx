import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { listModelosKyc } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, modelNombreCompleto } from "@/lib/utils";
import type { KycStatus } from "@/generated/prisma/enums";

const PARAM_TO_STATUS: Record<string, KycStatus> = {
  pendiente: "PENDING",
  aprobado: "APPROVED",
  rechazado: "REJECTED",
  requiere_cambios: "REQUIRES_CHANGES",
};

export default async function ModeracionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const activo = estado ?? "todas";
  const modelos = await listModelosKyc();

  const counts: Record<string, number> = {
    todas: modelos.length,
    pendiente: modelos.filter((m) => m.kyc.status === "PENDING").length,
    requiere_cambios: modelos.filter((m) => m.kyc.status === "REQUIRES_CHANGES").length,
    aprobado: modelos.filter((m) => m.kyc.status === "APPROVED").length,
    rechazado: modelos.filter((m) => m.kyc.status === "REJECTED").length,
  };

  const filtrados =
    activo === "todas"
      ? modelos
      : modelos.filter((m) => m.kyc.status === PARAM_TO_STATUS[activo]);

  return (
    <div>
      <PageHeader
        title="Moderación de registros"
        subtitle="Bandeja de auto-registro. Nada se publica sin aprobación del staff."
      />

      <StatusTabs
        basePath={APP_ROUTE.app.moderacion.index}
        activo={activo}
        counts={counts}
        tabs={[
          { value: "todas", label: "Todas" },
          { value: "pendiente", label: "Pendiente" },
          { value: "requiere_cambios", label: "Requiere cambios" },
          { value: "aprobado", label: "Aprobado" },
          { value: "rechazado", label: "Rechazado" },
        ]}
      />

      <Card>
        <ul className="divide-y divide-zinc-100">
          {filtrados.map((modelo) => (
            <li key={modelo.id}>
              <Link
                href={`${APP_ROUTE.app.moderacion.index}/${modelo.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50"
              >
                <Avatar name={modelNombreCompleto(modelo)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{modelNombreCompleto(modelo)}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {modelo.categories.map((c) => c.name).join(", ")} · Enviado el{" "}
                    {formatDate(modelo.kyc.createdAt)}
                  </p>
                </div>
                <EstadoBadge estado={modelo.kyc.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
              </Link>
            </li>
          ))}
          {filtrados.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-zinc-400">
              No hay registros en este estado.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
