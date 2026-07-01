import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchForm } from "@/components/ui/SearchForm";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { listClients } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await listClients();

  const filtered = q
    ? clients.filter(
        (c) =>
          c.company.toLowerCase().includes(q.toLowerCase()) ||
          c.contactName.toLowerCase().includes(q.toLowerCase()),
      )
    : clients;

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="CRM de empresas y contactos que solicitan talento."
        actions={
          <LinkButton href={APP_ROUTE.app.clients.index}>
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
            {filtered.map((client) => (
              <Tr key={client.id}>
                <Td className="font-medium text-zinc-900">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.company} size="sm" />
                    {client.company}
                  </div>
                </Td>
                <Td>
                  <span className="block text-zinc-700">{client.contactName}</span>
                  <span className="block text-xs text-zinc-400">{client.email}</span>
                </Td>
                <Td>{client.industry}</Td>
                <Td className="text-right">{client.totalEvents}</Td>
                <Td className="text-right font-medium text-zinc-900">{formatCurrency(client.totalRevenue)}</Td>
                <Td className="text-zinc-500">{formatDate(client.createdAt)}</Td>
              </Tr>
            ))}
            {filtered.length === 0 && (
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
