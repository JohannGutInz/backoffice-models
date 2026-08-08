import type { SiteSettings, Package, RegistrationApplication } from "./types";

// Demo data for the self-registration/moderation feedback flow — this surface
// has no backing DB table yet. Models/KYC/categories/packages/EventoFoto are
// real (see lib/data.ts, which reads those from Postgres via Prisma).
//
// `packages` below is legacy/unused (real packages come from prisma.package via
// lib/data.ts) — left as-is, not touched by the eventos/bookings/clientes/
// calendario/ingresos/portafolio cleanup.

export const AGENCY_ID = "ag_default";

// Demo credential while there is no real auth backend with hashing/staff DB.
// The day an auth API exists, loginAction (lib/actions.ts) is the only thing that changes.
export const DEMO_STAFF_CREDENTIAL = {
  email: "ing.johanngut@gmail.com",
  password: "musa2026",
};

export const registrationApplications: RegistrationApplication[] = [
  {
    id: "sol_01",
    agencyId: AGENCY_ID,
    fullName: "Lucía Fernández Ríos",
    email: "lucia.fernandez@mail.com",
    phone: "+52 55 9876 0001",
    birthDate: "2004-02-10",
    gender: "femenino",
    nationality: "Mexicana",
    location: "Ciudad de México",
    category: "moda",
    photoUrl: "",
    status: "pendiente",
    submittedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    reviewToken: "tok_a1b2c3",
  },
  {
    id: "sol_02",
    agencyId: AGENCY_ID,
    fullName: "Bruno Albanesi",
    email: "bruno.albanesi@mail.com",
    phone: "+52 55 9876 0002",
    birthDate: "1999-10-02",
    gender: "masculino",
    nationality: "Argentina",
    location: "Ciudad de México",
    category: "fitness",
    photoUrl: "",
    status: "pendiente",
    submittedAt: "2026-06-21",
    updatedAt: "2026-06-21",
    reviewToken: "tok_d4e5f6",
  },
  {
    id: "sol_03",
    agencyId: AGENCY_ID,
    fullName: "Paula Méndez",
    email: "paula.mendez@mail.com",
    phone: "+52 55 9876 0003",
    birthDate: "2003-05-17",
    gender: "femenino",
    nationality: "Mexicana",
    location: "Guadalajara",
    category: "editorial",
    photoUrl: "",
    status: "requiere_cambios",
    internalNote: "Falta verificar identidad con el documento oficial.",
    feedbackForModel: "¡Gracias por tu interés! Necesitamos que subas fotos sin filtro y con mejor iluminación natural para evaluar tu book.",
    submittedAt: "2026-06-15",
    updatedAt: "2026-06-18",
    reviewToken: "tok_g7h8i9",
  },
  {
    id: "sol_04",
    agencyId: AGENCY_ID,
    fullName: "Tomás Ibarra",
    email: "tomas.ibarra@mail.com",
    phone: "+52 55 9876 0004",
    birthDate: "1998-08-29",
    gender: "masculino",
    nationality: "Mexicana",
    location: "Monterrey",
    category: "comercial",
    photoUrl: "",
    status: "aprobado",
    internalNote: "Buen book, aprobado sin observaciones.",
    feedbackForModel: "¡Bienvenido a la agencia! Pronto te contactaremos para tu primer casting.",
    submittedAt: "2026-06-02",
    updatedAt: "2026-06-05",
    reviewToken: "tok_j1k2l3",
  },
  {
    id: "sol_05",
    agencyId: AGENCY_ID,
    fullName: "Daniela Soto",
    email: "daniela.soto@mail.com",
    phone: "+52 55 9876 0005",
    birthDate: "2005-01-09",
    gender: "femenino",
    nationality: "Mexicana",
    location: "Puebla",
    category: "influencer",
    photoUrl: "",
    status: "rechazado",
    internalNote: "Perfil no encaja con las categorías activas de la agencia.",
    feedbackForModel: "Gracias por tu interés. En este momento no encontramos un encaje con las categorías que manejamos.",
    submittedAt: "2026-05-28",
    updatedAt: "2026-06-01",
    reviewToken: "tok_m4n5o6",
    rejectedAt: "2026-06-01",
  },
];

export const packages: Package[] = [
  { id: "pkg_01", agencyId: AGENCY_ID, name: "Propuesta Primavera — Vogue Studio", clientId: "cli_01", modelIds: ["mdl_01", "mdl_05", "mdl_03"], status: "aprobado", total: 51000, createdAt: "2026-06-10" },
  { id: "pkg_02", agencyId: AGENCY_ID, name: "Glow Launch — Lumière", clientId: "cli_02", modelIds: ["mdl_03", "mdl_06"], status: "enviado", total: 18500, createdAt: "2026-06-18" },
  { id: "pkg_03", agencyId: AGENCY_ID, name: "Catálogo Otoño — Aurora Retail", clientId: "cli_03", modelIds: ["mdl_02", "mdl_08"], status: "enviado", total: 15000, createdAt: "2026-06-19" },
  { id: "pkg_04", agencyId: AGENCY_ID, name: "Nova Run 2026", clientId: "cli_04", modelIds: ["mdl_04", "mdl_02"], status: "borrador", total: 16500, createdAt: "2026-06-21" },
  { id: "pkg_05", agencyId: AGENCY_ID, name: "Joyería Cantera — Capsula", clientId: "cli_05", modelIds: ["mdl_01"], status: "rechazado", total: 18000, createdAt: "2026-05-12" },
];

export const siteSettings: SiteSettings = {
  agencyId: AGENCY_ID,
  agencyName: "Glamour Models",
  logoUrl: "",
  primaryColor: "#BA1B5D",
  heroTitle: "SOMOS LO QUE QUIERES VER",
  heroSubtitle: "AGENCIA DE MODELOS Y EDECANES / PROTOCOLO",
  publicRegistrationActive: true,
  registrationLinkSlug: "registro-glamour-2026",
};
