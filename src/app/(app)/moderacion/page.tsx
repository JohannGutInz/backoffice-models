import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EstadoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { listSolicitudes } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function ModeracionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const activo = estado ?? "todas";
  const solicitudes = await listSolicitudes();

  const counts: Record<string, number> = {
    todas: solicitudes.length,
    pendiente: solicitudes.filter((s) => s.estado === "pendiente").length,
    requiere_cambios: solicitudes.filter((s) => s.estado === "requiere_cambios").length,
    aprobado: solicitudes.filter((s) => s.estado === "aprobado").length,
    rechazado: solicitudes.filter((s) => s.estado === "rechazado").length,
  };

  const filtradas = activo === "todas" ? solicitudes : solicitudes.filter((s) => s.estado === activo);
  const ordenadas = [...filtradas].sort(
    (a, b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Moderación de registros"
        subtitle="Bandeja de auto-registro. Nada se publica sin aprobación del staff."
      />

      <StatusTabs
        basePath="/moderacion"
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
          {ordenadas.map((sol) => (
            <li key={sol.id}>
              <Link href={`/moderacion/${sol.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
                <Avatar name={sol.nombreCompleto} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{sol.nombreCompleto}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {CATEGORIA_LABEL[sol.categoria]} · Enviado el {formatDate(sol.enviadoEn)}
                  </p>
                </div>
                <EstadoBadge estado={sol.estado} />
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
              </Link>
            </li>
          ))}
          {ordenadas.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-zinc-400">No hay solicitudes en este estado.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
