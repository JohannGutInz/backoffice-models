import { cookies } from "next/headers";
import {
  AGENCY_ID,
  bookings,
  clients,
  siteSettings,
  events,
  income,
  monthlyRevenue,
  models,
  packages,
  registrationApplications,
} from "./mock-data";
import type {
  Booking,
  Client,
  AgencyEvent,
  Model,
  Package,
  RegistrationApplication,
  UserW,
} from "./types";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "./routes";
import { isProfileComplete } from "./utils";

// Data access layer. Today it reads from the in-memory fixtures (mock-data.ts).
// When the central API exists, these functions are the only place that changes:
// the pages already call everything with `await`, ready to become real fetch() calls.

function byId<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export async function getCurrentUser() {
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

// ---------- Models ----------

const modelInclude = {
  categories: true,
  activities: true,
  country: true,
  city: { include: { state: true } },
  assets: true,
} as const;

export type ModelWithRelations = Awaited<ReturnType<typeof listModels>>[number];

export async function listModels() {
  return prisma.model.findMany({
    include: modelInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getModel(id: string) {
  return prisma.model.findUnique({
    where: { id },
    include: modelInclude,
  });
}

export type OwnModelWithKyc = Awaited<ReturnType<typeof getOwnModel>>;

export async function getOwnModel(userId: string) {
  return prisma.model.findUnique({
    where: { userId },
    include: { ...modelInclude, kyc: true },
  });
}

export function modelName(id: string): string {
  return byId(models, id)?.stageName ?? "Modelo eliminado";
}

// ---------- Moderation / KYC ----------

const kycModelInclude = {
  kyc: true,
  categories: true,
  activities: true,
  country: true,
  city: { include: { state: true } },
  assets: true,
} as const;

export type ModelWithKyc = Awaited<ReturnType<typeof listModelsKyc>>[number];

export async function listModelsKyc() {
  const models = await prisma.model.findMany({
    include: kycModelInclude,
    orderBy: { kyc: { createdAt: "desc" } },
  });
  return models.filter(isProfileComplete);
}

export async function getModelKyc(id: string) {
  return prisma.model.findUnique({
    where: { id },
    include: kycModelInclude,
  });
}

// ---------- Moderation / feedback flow (mock, temporary token link) ----------

export async function getApplicationByToken(token: string): Promise<RegistrationApplication | undefined> {
  return registrationApplications.find((s) => s.reviewToken === token);
}

// ---------- Clients ----------

export async function listClients(): Promise<Client[]> {
  return clients.filter((c) => c.agencyId === AGENCY_ID);
}

export async function getClient(id: string): Promise<Client | undefined> {
  return byId(clients, id);
}

export function clientName(id: string): string {
  return byId(clients, id)?.company ?? "Cliente eliminado";
}

// ---------- Events ----------

export async function listEvents(): Promise<AgencyEvent[]> {
  return events.filter((e) => e.agencyId === AGENCY_ID);
}

export async function getEvent(id: string): Promise<AgencyEvent | undefined> {
  return byId(events, id);
}

export function eventName(id: string): string {
  return byId(events, id)?.name ?? "Evento eliminado";
}

// ---------- Bookings ----------

export async function listBookings(): Promise<Booking[]> {
  return bookings.filter((b) => b.agencyId === AGENCY_ID);
}

// ---------- Packages ----------

export async function listPackages(): Promise<Package[]> {
  return packages.filter((p) => p.agencyId === AGENCY_ID);
}

// ---------- Income ----------

export async function listIncome() {
  return income.filter((i) => i.agencyId === AGENCY_ID);
}

export async function getMonthlyRevenue() {
  return monthlyRevenue;
}

// ---------- Site settings ----------

export async function getSiteSettings() {
  return siteSettings;
}

// ---------- Catalogs (categories) ----------

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ---------- Catalogs (activities) ----------

export async function listActivities() {
  return prisma.activity.findMany({ orderBy: { name: "asc" } });
}

// ---------- Dashboard stats ----------

export async function getDashboardStats() {
  const [bks, ings, pkgs, cli, kycModels, mdls] = await Promise.all([
    listBookings(),
    listIncome(),
    listPackages(),
    listClients(),
    listModelsKyc(),
    listModels(),
  ]);

  const pendingKyc = kycModels.filter((m) => m.kyc.status === "PENDING" || m.kyc.status === "REQUIRES_CHANGES").length;

  const activeBookings = bks.filter((b) => b.status === "pendiente" || b.status === "confirmado");
  const pendingBookings = bks.filter((b) => b.status === "pendiente");
  const confirmedBookings = bks.filter((b) => b.status === "confirmado");

  const currentMonth = new Date().getMonth();
  const currentMonthIncome = ings
    .filter((i) => new Date(i.date).getMonth() === currentMonth)
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingPackages = pkgs.filter((p) => p.status === "borrador" || p.status === "enviado");
  const pendingApplications = pendingKyc;
  const activeModels = mdls;

  const bookingsByStatus = [
    { status: "pendiente", total: bks.filter((b) => b.status === "pendiente").length },
    { status: "confirmado", total: bks.filter((b) => b.status === "confirmado").length },
    { status: "completado", total: bks.filter((b) => b.status === "completado").length },
    { status: "cancelado", total: bks.filter((b) => b.status === "cancelado").length },
  ].filter((s) => s.total > 0);

  const latestBookings = [...bks]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    activeBookings: activeBookings.length,
    pendingBookings: pendingBookings.length,
    confirmedBookings: confirmedBookings.length,
    currentMonthIncome,
    pendingPackages: pendingPackages.length,
    totalClients: cli.length,
    pendingApplications: pendingApplications,
    activeModels: activeModels.length,
    bookingsByStatus,
    totalBookings: bks.length,
    latestBookings,
    draftPackages: pkgs.filter((p) => p.status === "borrador").length,
  };
}
