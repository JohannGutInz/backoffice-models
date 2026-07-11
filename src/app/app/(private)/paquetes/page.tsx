import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { listPaquetes } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, modelNombreCompleto } from "@/lib/utils";

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

export default async function PaquetesPage() {
  const paquetes = await listPaquetes();

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Propuestas de talento para clientes — agrupá modelos y comparte el link."
        actions={
          <LinkButton href={APP_ROUTE.app.paquetes.nuevo}>
            <Plus className="h-4 w-4" /> Nuevo paquete
          </LinkButton>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Paquete</Th>
            <Th>Modelos</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {paquetes.map((pkg) => (
              <Tr key={pkg.id}>
                <Td>
                  <Link
                    href={`${APP_ROUTE.app.paquetes.index}/${pkg.id}`}
                    className="font-medium text-zinc-900 hover:text-gold-600"
                  >
                    {pkg.name}
                  </Link>
                  {pkg.description && (
                    <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">{pkg.description}</p>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {pkg.models.slice(0, 5).map((m) => (
                        <Avatar key={m.id} name={modelNombreCompleto(m)} size="sm" className="ring-2 ring-white" />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {pkg.models.length} {pkg.models.length === 1 ? "modelo" : "modelos"}
                    </span>
                  </div>
                </Td>
                <Td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[pkg.status] ?? ""}`}>
                    {STATUS_LABEL[pkg.status] ?? pkg.status}
                  </span>
                </Td>
                <Td className="text-zinc-500">{formatDate(pkg.createdAt)}</Td>
                <Td>
                  <Link
                    href={`${APP_ROUTE.app.paquetes.index}/${pkg.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    Ver <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Td>
              </Tr>
            ))}
            {paquetes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Aún no hay paquetes. Crea el primero con el botón de arriba.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
