"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { estadoLabel } from "@/components/ui/Badge";

const ESTATUS_COLOR: Record<string, string> = {
  pendiente: "#c94d81",
  confirmado: "#3f3f46",
  completado: "#059669",
  cancelado: "#fb7185",
  aprobado: "#059669",
  enviado: "#c94d81",
  borrador: "#a1a1aa",
  rechazado: "#fb7185",
};

export function StatusDonutChart({ data }: { data: { estatus: string; total: number }[] }) {
  const totalGeneral = data.reduce((sum, d) => sum + d.total, 0);

  if (totalGeneral === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center text-sm text-zinc-400">
        Sin registros aún
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="estatus"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={data.length > 1 ? 3 : 0}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.estatus} fill={ESTATUS_COLOR[entry.estatus] ?? "#a1a1aa"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => [String(value), estadoLabel(item.payload.estatus)]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {data.map((entry) => (
          <li key={entry.estatus} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: ESTATUS_COLOR[entry.estatus] ?? "#a1a1aa" }}
            />
            {estadoLabel(entry.estatus)}
          </li>
        ))}
      </ul>
    </div>
  );
}
