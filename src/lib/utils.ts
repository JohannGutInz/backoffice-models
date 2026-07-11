import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Las fechas de dominio son "YYYY-MM-DD" (sin hora). Parsearlas con `new Date(iso)`
// las interpreta como medianoche UTC, lo que puede mostrar el día anterior en
// servidores con timezone negativo. Por eso se parsean siempre como fecha local.
export function parseDateOnly(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? parseDateOnly(value) : value;
  return new Intl.DateTimeFormat("es-MX", opts ?? { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatLongDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

export function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(date);
  return formatted.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function greetingForHour(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function modelNombreCompleto(m: { firstName: string; lastNameP: string; lastNameM?: string | null }): string {
  return [m.firstName, m.lastNameP, m.lastNameM].filter(Boolean).join(" ");
}

export function calcularEdad(fechaNacimientoIso: string): number {
  const nacimiento = parseDateOnly(fechaNacimientoIso);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumple) edad -= 1;
  return edad;
}
