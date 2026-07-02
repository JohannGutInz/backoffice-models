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

// Domain dates are "YYYY-MM-DD" (no time). Parsing them with `new Date(iso)`
// interprets them as UTC midnight, which can show the previous day on
// servers with a negative timezone. That's why they're always parsed as a local date.
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

export function formatFullName(person: {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string | null;
}): string {
  return [person.firstName, person.paternalLastName, person.maternalLastName].filter(Boolean).join(" ");
}

export function isProfileComplete(model: {
  height: number | null;
  currentWeight: number | null;
  shirtSize: string | null;
  pantsSizeScale: string | null;
  pantsSize: string | null;
  activities: unknown[];
}): boolean {
  return (
    model.height !== null &&
    model.currentWeight !== null &&
    model.shirtSize !== null &&
    model.pantsSizeScale !== null &&
    model.pantsSize !== null &&
    model.activities.length > 0
  );
}

export function calculateAge(birthDateIso: string): number {
  const birthDate = parseDateOnly(birthDateIso);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasNotHadBirthdayYet =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (hasNotHadBirthdayYet) age -= 1;
  return age;
}
