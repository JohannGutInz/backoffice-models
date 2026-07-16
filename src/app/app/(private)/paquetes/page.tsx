import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { listPackages, clientName, modelName } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatFullName, formatCurrency } from "@/lib/utils";

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

export default async function PackagesPage() {
  const packages = await listPackages();
  const sorted = [...packages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Propuestas de talento para clientes — agrupá modelos y comparte el link."
        actions={
          <LinkButton href={`${APP_ROUTE.app.packages.index}/nuevo`}>
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
            {sorted.map((pkg) => (
              <Tr key={pkg.id}>
                <Td className="font-medium text-zinc-900">{pkg.name}</Td>
                <Td>{clientName(pkg.clientId)}</Td>
                <Td>
                  <Link
                    href={`${APP_ROUTE.app.packages.index}/${pkg.id}`}
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
                      {pkg.modelIds.slice(0, 4).map((id) => (
                        <Avatar key={id} name={modelName(id)} size="sm" className="ring-2 ring-white" />
                      ))}
                    </div>
                    <span className="ml-2.5 text-xs text-zinc-500">
                      {pkg.modelIds.length} {pkg.modelIds.length === 1 ? "modelo" : "modelos"}
                    </span>
                  </div>
                </Td>
                <Td className="text-right font-medium text-zinc-900">{formatCurrency(pkg.total)}</Td>
                <Td>
                  <StatusBadge status={pkg.status} />
                </Td>
                <Td className="text-zinc-500">{formatDate(pkg.createdAt)}</Td>
              </Tr>
            ))}
            {sorted.length === 0 && (
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
