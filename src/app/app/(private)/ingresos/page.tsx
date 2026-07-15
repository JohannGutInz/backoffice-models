import { CircleDollarSign, Receipt, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { getMonthlyRevenue, listIncome, clientName, eventName } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
};

export default async function IncomePage() {
  const [income, monthlyRevenue] = await Promise.all([listIncome(), getMonthlyRevenue()]);

  const grandTotal = income.reduce((sum, i) => sum + i.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentMonthTotal = income
    .filter((i) => new Date(i.date).getMonth() === currentMonth)
    .reduce((sum, i) => sum + i.amount, 0);
  const average = income.length > 0 ? grandTotal / income.length : 0;

  const sorted = [...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <PageHeader title="Control de ingresos" subtitle="Registro básico de ingresos por evento." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Ingresos totales" value={formatCurrency(grandTotal)} icon={CircleDollarSign} tone="emerald" />
        <StatCard title="Ingresos del mes" value={formatCurrency(currentMonthTotal)} icon={TrendingUp} tone="gold" />
        <StatCard
          title="Promedio por transacción"
          value={formatCurrency(average)}
          subtitle={`${income.length} transacciones registradas`}
          icon={Receipt}
          tone="zinc"
        />
      </div>

      <Card className="mt-6">
        <CardHeader title="Ingresos por mes" subtitle="Últimos 6 meses" />
        <div className="px-2 pb-4">
          <RevenueBarChart data={monthlyRevenue} />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Transacciones" />
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Evento</Th>
            <Th>Cliente</Th>
            <Th>Método</Th>
            <Th className="text-right">Monto</Th>
          </THead>
          <tbody>
            {sorted.map((entry) => (
              <Tr key={entry.id}>
                <Td className="text-zinc-500">{formatDate(entry.date)}</Td>
                <Td className="font-medium text-zinc-900">{eventName(entry.eventId)}</Td>
                <Td>{clientName(entry.clientId)}</Td>
                <Td className="text-zinc-500">{METHOD_LABEL[entry.method]}</Td>
                <Td className="text-right font-medium text-emerald-700">+{formatCurrency(entry.amount)}</Td>
              </Tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-sm text-zinc-400">
                  Aún no hay ingresos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
