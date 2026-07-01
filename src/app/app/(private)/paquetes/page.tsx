import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { listPackages, clientName, modelName } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PackagesPage() {
  const packages = await listPackages();
  const sorted = [...packages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Agrupa modelos en una propuesta para enviar al cliente."
        actions={
          <LinkButton href={APP_ROUTE.app.packages.index}>
            <Plus className="h-4 w-4" /> Nuevo paquete
          </LinkButton>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Paquete</Th>
            <Th>Cliente</Th>
            <Th>Modelos incluidos</Th>
            <Th className="text-right">Total</Th>
            <Th>Estado</Th>
            <Th>Creado</Th>
          </THead>
          <tbody>
            {sorted.map((pkg) => (
              <Tr key={pkg.id}>
                <Td className="font-medium text-zinc-900">{pkg.name}</Td>
                <Td>{clientName(pkg.clientId)}</Td>
                <Td>
                  <div className="flex items-center">
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
                <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Aún no hay paquetes creados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
