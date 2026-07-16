// Domain model v1 — talent agency backoffice.
// Every entity carries agencyId to support logical multi-tenancy from day one,
// even though today only one agency exists (see CLAUDE-proyecto-real.md).

import { User } from "@/generated/prisma/browser";

export type ModelStatus = "activo" | "borrador" | "inactivo";

export type ModelCategory =
  | "moda"
  | "comercial"
  | "editorial"
  | "fitness"
  | "promocional"
  | "influencer";

export interface Model {
  id: string;
  agencyId: string;
  modelNumber: string;
  stageName: string;
  legalName: string;
  birthDate: string;
  gender: "femenino" | "masculino" | "no binario";
  nationality: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    socialMedia?: string;
  };
  physical?: {
    heightCm?: number;
    measurements?: string;
    sizes?: string;
    hairColor?: string;
    eyeColor?: string;
    skinTone?: string;
  };
  category: ModelCategory;
  tags: string[];
  experienceLevel: "nuevo" | "intermedio" | "experimentado";
  mainPhotoUrl: string;
  bookUrls: string[];
  status: ModelStatus;
  featured: boolean;
  // Explicit curation: a model can be "activo" to operate bookings
  // without yet being ready/approved to show up in the public showcase.
  publicOnLanding: boolean;
  availability: "disponible" | "ocupado" | "no disponible";
  baseRate: number;
  internalNotes?: string;
  consent?: {
    accepted: boolean;
    date: string;
    documentVersion: string;
    scope: string;
  };
  createdAt: string;
}

export type ApplicationStatus =
  | "pendiente"
  | "requiere_cambios"
  | "aprobado"
  | "rechazado";

export interface RegistrationApplication {
  id: string;
  agencyId: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: Model["gender"];
  nationality: string;
  location: string;
  category: ModelCategory;
  photoUrl: string;
  status: ApplicationStatus;
  internalNote?: string;
  feedbackForModel?: string;
  submittedAt: string;
  updatedAt: string;
  reviewToken: string;
  rejectedAt?: string;
}

export interface Client {
  id: string;
  agencyId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  totalEvents: number;
  totalRevenue: number;
  createdAt: string;
}

export type EventStatus = "planeado" | "confirmado" | "en_curso" | "finalizado" | "cancelado";

export interface AgencyEvent {
  id: string;
  agencyId: string;
  name: string;
  clientId: string;
  type: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  bookingIds: string[];
  notas?: string | null;
  recurringDays?: number[];
  dailyStartTime?: string | null;
  dailyEndTime?: string | null;
  cubierto?: boolean;
  modelo?: {
    id: string;
    firstName: string;
    paternalLastName: string;
    maternalLastName?: string | null;
  } | null;
}

export type BookingStatus = "pendiente" | "confirmado" | "completado" | "cancelado";

export interface Booking {
  id: string;
  agencyId: string;
  eventId: string;
  modelId: string;
  rate: number;
  status: BookingStatus;
  date: string;
  notes?: string;
}

export type PackageStatus = "borrador" | "enviado" | "aprobado" | "rechazado";

export interface Package {
  id: string;
  agencyId: string;
  name: string;
  clientId: string;
  modelIds: string[];
  status: PackageStatus;
  total: number;
  createdAt: string;
  description?: string | null;
  publicToken?: string | null;
}

export interface Income {
  id: string;
  agencyId: string;
  eventId: string;
  clientId: string;
  amount: number;
  method: "transferencia" | "tarjeta" | "efectivo";
  date: string;
}

export type StaffRole = "admin" | "booker" | "moderador" | "finanzas";

export interface StaffUser {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  role: StaffRole;
  avatarInitials: string;
}

export interface SiteSettings {
  agencyId: string;
  agencyName: string;
  logoUrl: string;
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  publicRegistrationActive: boolean;
  registrationLinkSlug: string;
}

// UserWithoutPassword
export type UserW = Omit<User, "hashedPassword">;
