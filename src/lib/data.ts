import { cookies } from "next/headers";
import {
  AGENCY_ID,
  bookings,
  clientes,
  configuracionSitio,
  eventos,
  ingresos,
  ingresosPorMes,
  modelos,
  paquetes,
  solicitudesRegistro,
} from "./mock-data";
import type {
  Booking,
  Cliente,
  Evento,
  Modelo,
  Paquete,
  SolicitudRegistro,
  UserW,
} from "./types";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "./routes";

// Capa de acceso a datos. Hoy lee de los fixtures en memoria (mock-data.ts).
// Cuando exista la API central, estas funciones son el único lugar que cambia:
// las páginas ya llaman todo con `await`, listas para volverse fetch() reales.

function byId<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export async function getUsuarioActual() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);

  if (!token) {
    redirect(APP_ROUTE.app.login.index);
  }

  const parsedToken = await verifySessionToken(token.value);

  if (!parsedToken) {
    cookieStore.delete(SESSION_COOKIE);
    redirect(APP_ROUTE.app.login.index);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: parsedToken.sub
    },
    omit: {
      hashedPassword: true,
    },
  });


  if (!user) {
    cookieStore.delete(SESSION_COOKIE);
    redirect(APP_ROUTE.app.login.index);
  }

  return user satisfies UserW;
}

// ---------- Modelos ----------

const modelInclude = {
  categories: true,
  country: true,
  city: { include: { state: true } },
} as const;

export type ModelWithRelations = Awaited<ReturnType<typeof listModelos>>[number];

export async function listModelos() {
  return prisma.model.findMany({
    include: modelInclude,
    orderBy: { fullName: "asc" },
  });
}

export async function getModelo(id: string) {
  return prisma.model.findUnique({
    where: { id },
    include: modelInclude,
  });
}

export async function getModeloPropio(userId: string) {
  return prisma.model.findUnique({
    where: { userId },
    include: modelInclude,
  });
}

export function nombreModelo(id: string): string {
  return byId(modelos, id)?.nombreArtistico ?? "Modelo eliminado";
}

// ---------- Moderación / KYC ----------

const kycModelInclude = {
  kyc: true,
  categories: true,
  country: true,
  city: { include: { state: true } },
} as const;

export type ModelWithKyc = Awaited<ReturnType<typeof listModelosKyc>>[number];

export async function listModelosKyc() {
  return prisma.model.findMany({
    include: kycModelInclude,
    orderBy: { kyc: { createdAt: "desc" } },
  });
}

export async function getModeloKyc(id: string) {
  return prisma.model.findUnique({
    where: { id },
    include: kycModelInclude,
  });
}

// ---------- Moderación / retro flow (mock, enlace temporal por token) ----------

export async function getSolicitudPorToken(token: string): Promise<SolicitudRegistro | undefined> {
  return solicitudesRegistro.find((s) => s.tokenRevision === token);
}

// ---------- Clientes ----------

export async function listClientes(): Promise<Cliente[]> {
  return clientes.filter((c) => c.agencyId === AGENCY_ID);
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  return byId(clientes, id);
}

export function nombreCliente(id: string): string {
  return byId(clientes, id)?.empresa ?? "Cliente eliminado";
}

// ---------- Eventos ----------

export async function listEventos(): Promise<Evento[]> {
  return eventos.filter((e) => e.agencyId === AGENCY_ID);
}

export async function getEvento(id: string): Promise<Evento | undefined> {
  return byId(eventos, id);
}

export function nombreEvento(id: string): string {
  return byId(eventos, id)?.nombre ?? "Evento eliminado";
}

// ---------- Bookings ----------

export async function listBookings(): Promise<Booking[]> {
  return bookings.filter((b) => b.agencyId === AGENCY_ID);
}

// ---------- Paquetes ----------

export async function listPaquetes(): Promise<Paquete[]> {
  return paquetes.filter((p) => p.agencyId === AGENCY_ID);
}

// ---------- Ingresos ----------

export async function listIngresos() {
  return ingresos.filter((i) => i.agencyId === AGENCY_ID);
}

export async function getIngresosPorMes() {
  return ingresosPorMes;
}

// ---------- Configuración del sitio ----------

export async function getConfiguracionSitio() {
  return configuracionSitio;
}

// ---------- Catálogos (categorías) ----------

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ---------- Estadísticas del dashboard ----------

export async function getDashboardStats() {
  const [bks, ings, pkgs, cli, kycPendientes, mdls] = await Promise.all([
    listBookings(),
    listIngresos(),
    listPaquetes(),
    listClientes(),
    prisma.kyc.count({ where: { status: { in: ["PENDING", "REQUIRES_CHANGES"] } } }),
    listModelos(),
  ]);

  const bookingsActivos = bks.filter((b) => b.estado === "pendiente" || b.estado === "confirmado");
  const bookingsPendientes = bks.filter((b) => b.estado === "pendiente");
  const bookingsConfirmados = bks.filter((b) => b.estado === "confirmado");

  const mesActual = new Date().getMonth();
  const ingresosMesActual = ings
    .filter((i) => new Date(i.fecha).getMonth() === mesActual)
    .reduce((sum, i) => sum + i.monto, 0);

  const paquetesPendientes = pkgs.filter((p) => p.estado === "borrador" || p.estado === "enviado");
  const solicitudesPendientes = kycPendientes;
  const modelosActivos = mdls;

  const bookingsPorEstatus = [
    { estatus: "pendiente", total: bks.filter((b) => b.estado === "pendiente").length },
    { estatus: "confirmado", total: bks.filter((b) => b.estado === "confirmado").length },
    { estatus: "completado", total: bks.filter((b) => b.estado === "completado").length },
    { estatus: "cancelado", total: bks.filter((b) => b.estado === "cancelado").length },
  ].filter((s) => s.total > 0);

  const ultimosBookings = [...bks]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  return {
    bookingsActivos: bookingsActivos.length,
    bookingsPendientes: bookingsPendientes.length,
    bookingsConfirmados: bookingsConfirmados.length,
    ingresosMesActual,
    paquetesPendientes: paquetesPendientes.length,
    clientesTotal: cli.length,
    solicitudesPendientes: solicitudesPendientes,
    modelosActivos: modelosActivos.length,
    bookingsPorEstatus,
    bookingsTotal: bks.length,
    ultimosBookings,
    paquetesBorrador: pkgs.filter((p) => p.estado === "borrador").length,
  };
}
