import { CircleDollarSign, Receipt, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { getIngresosPorMes, listIngresos, nombreCliente, nombreEvento } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const METODO_LABEL: Record<string, string> = {
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
};

export default async function IngresosPage() {
  const [ingresos, ingresosMensuales] = await Promise.all([listIngresos(), getIngresosPorMes()]);

  const totalGeneral = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const mesActual = new Date().getMonth();
  const totalMesActual = ingresos
    .filter((i) => new Date(i.fecha).getMonth() === mesActual)
    .reduce((sum, i) => sum + i.monto, 0);
  const promedio = ingresos.length > 0 ? totalGeneral / ingresos.length : 0;

  const ordenados = [...ingresos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div>
      <PageHeader title="Control de ingresos" subtitle="Registro básico de ingresos por evento." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Ingresos totales" value={formatCurrency(totalGeneral)} icon={CircleDollarSign} tone="emerald" />
        <StatCard title="Ingresos del mes" value={formatCurrency(totalMesActual)} icon={TrendingUp} tone="gold" />
        <StatCard
          title="Promedio por transacción"
          value={formatCurrency(promedio)}
          subtitle={`${ingresos.length} transacciones registradas`}
          icon={Receipt}
          tone="zinc"
        />
      </div>

      <Card className="mt-6">
        <CardHeader title="Ingresos por mes" subtitle="Últimos 6 meses" />
        <div className="px-2 pb-4">
          <RevenueBarChart data={ingresosMensuales} />
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
            {ordenados.map((ingreso) => (
              <Tr key={ingreso.id}>
                <Td className="text-zinc-500">{formatDate(ingreso.fecha)}</Td>
                <Td className="font-medium text-zinc-900">{nombreEvento(ingreso.eventoId)}</Td>
                <Td>{nombreCliente(ingreso.clienteId)}</Td>
                <Td className="text-zinc-500">{METODO_LABEL[ingreso.metodo]}</Td>
                <Td className="text-right font-medium text-emerald-700">+{formatCurrency(ingreso.monto)}</Td>
              </Tr>
            ))}
            {ordenados.length === 0 && (
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
