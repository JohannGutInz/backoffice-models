import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "gold" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  gold: "bg-gold-50 text-gold-700 ring-gold-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

const ESTADO_TONE: Record<string, BadgeTone> = {
  activo: "success",
  aprobado: "success",
  confirmado: "success",
  completado: "success",
  finalizado: "success",
  disponible: "success",
  pendiente: "warning",
  enviado: "gold",
  planeado: "info",
  borrador: "neutral",
  requiere_cambios: "warning",
  ocupado: "warning",
  inactivo: "neutral",
  no_disponible: "neutral",
  rechazado: "danger",
  cancelado: "danger",
};

export function estadoTone(estado: string): BadgeTone {
  return ESTADO_TONE[estado] ?? "neutral";
}

const ESTADO_LABEL: Record<string, string> = {
  requiere_cambios: "Requiere cambios",
  no_disponible: "No disponible",
};

export function estadoLabel(estado: string): string {
  return (
    ESTADO_LABEL[estado] ??
    estado.replace(/_/g, " ").replace(/^\p{L}/u, (c) => c.toUpperCase())
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EstadoBadge({ estado, className }: { estado: string; className?: string }) {
  return (
    <Badge tone={estadoTone(estado)} className={className}>
      {estadoLabel(estado)}
    </Badge>
  );
}
