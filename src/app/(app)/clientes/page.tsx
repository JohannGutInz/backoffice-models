import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/ui/SearchForm";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { listClientes } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clientes = await listClientes();

  const filtrados = q
    ? clientes.filter(
        (c) =>
          c.empresa.toLowerCase().includes(q.toLowerCase()) ||
          c.contactoNombre.toLowerCase().includes(q.toLowerCase()),
      )
    : clientes;

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="CRM de empresas y contactos que solicitan talento."
        actions={
          <LinkButton href="/clientes">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </LinkButton>
        }
      />

      <div className="mb-5">
        <SearchForm action="/clientes" placeholder="Buscar empresa o contacto…" defaultValue={q} />
      </div>

      <Card>
        <Table>
          <THead>
            <Th>Empresa</Th>
            <Th>Contacto</Th>
            <Th>Industria</Th>
            <Th className="text-right">Eventos</Th>
            <Th className="text-right">Ingresos totales</Th>
            <Th>Cliente desde</Th>
          </THead>
          <tbody>
            {filtrados.map((cliente) => (
              <Tr key={cliente.id}>
                <Td className="font-medium text-zinc-900">
                  <div className="flex items-center gap-3">
                    <Avatar name={cliente.empresa} size="sm" />
                    {cliente.empresa}
                  </div>
                </Td>
                <Td>
                  <span className="block text-zinc-700">{cliente.contactoNombre}</span>
                  <span className="block text-xs text-zinc-400">{cliente.correo}</span>
                </Td>
                <Td>{cliente.industria}</Td>
                <Td className="text-right">{cliente.eventosTotales}</Td>
                <Td className="text-right font-medium text-zinc-900">{formatCurrency(cliente.ingresosTotales)}</Td>
                <Td className="text-zinc-500">{formatDate(cliente.creadoEn)}</Td>
              </Tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Ningún cliente coincide con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
