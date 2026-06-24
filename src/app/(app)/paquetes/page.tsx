import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { EstadoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { listPaquetes, nombreCliente, nombreModelo } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaquetesPage() {
  const paquetes = await listPaquetes();
  const ordenados = [...paquetes].sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Agrupa modelos en una propuesta para enviar al cliente."
        actions={
          <LinkButton href="/paquetes">
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
            {ordenados.map((paquete) => (
              <Tr key={paquete.id}>
                <Td className="font-medium text-zinc-900">{paquete.nombre}</Td>
                <Td>{nombreCliente(paquete.clienteId)}</Td>
                <Td>
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {paquete.modeloIds.slice(0, 4).map((id) => (
                        <Avatar key={id} name={nombreModelo(id)} size="sm" className="ring-2 ring-white" />
                      ))}
                    </div>
                    <span className="ml-2.5 text-xs text-zinc-500">
                      {paquete.modeloIds.length} {paquete.modeloIds.length === 1 ? "modelo" : "modelos"}
                    </span>
                  </div>
                </Td>
                <Td className="text-right font-medium text-zinc-900">{formatCurrency(paquete.total)}</Td>
                <Td>
                  <EstadoBadge estado={paquete.estado} />
                </Td>
                <Td className="text-zinc-500">{formatDate(paquete.creadoEn)}</Td>
              </Tr>
            ))}
            {ordenados.length === 0 && (
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
