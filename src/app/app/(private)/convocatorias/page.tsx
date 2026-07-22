import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { listConvocatorias } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  OPEN: "Publicada",
  CLOSED: "Cerrada",
};

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600",
  OPEN: "bg-emerald-50 text-emerald-700",
  OPEN_EXPIRED: "bg-amber-50 text-amber-700",
  CLOSED: "bg-zinc-200 text-zinc-500",
};

function statusDisplay(status: string, fechaEvento: Date) {
  if (status === "OPEN" && fechaEvento < new Date()) {
    return { label: "Vencida", className: STATUS_CLASS.OPEN_EXPIRED };
  }
  return { label: STATUS_LABEL[status] ?? status, className: STATUS_CLASS[status] ?? "" };
}

export default async function ConvocatoriasPage() {
  const convocatorias = await listConvocatorias();

  return (
    <div>
      <PageHeader
        title="Convocatorias"
        subtitle="Avisos de trabajo publicados para el roster de talento aprobado."
        actions={
          <LinkButton href={APP_ROUTE.app.convocatorias.nueva}>
            <Plus className="h-4 w-4" /> Nueva convocatoria
          </LinkButton>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Título</Th>
            <Th>Tipo</Th>
            <Th>Ciudad</Th>
            <Th>Fecha evento</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {convocatorias.map((c) => {
              const { label, className } = statusDisplay(c.status, c.fechaEvento);
              return (
                <Tr key={c.id}>
                  <Td>
                    <Link
                      href={APP_ROUTE.app.convocatorias.detail(c.id)}
                      className="font-medium text-zinc-900 hover:text-gold-600"
                    >
                      {c.titulo}
                    </Link>
                  </Td>
                  <Td className="text-zinc-500">{c.tipo}</Td>
                  <Td className="text-zinc-500">{c.ciudad}</Td>
                  <Td className="text-zinc-500">
                    {c.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
                      {label}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={APP_ROUTE.app.convocatorias.detail(c.id)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Td>
                </Tr>
              );
            })}
            {convocatorias.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Aún no hay convocatorias. Crea la primera con el botón de arriba.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
