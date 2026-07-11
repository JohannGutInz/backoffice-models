import { clientes, eventos, AGENCY_ID } from "./mock-data";
import { prisma } from "@/db";

// Frontera pública. Solo devuelve modelos con KYC aprobado y visibles. Sin datos privados.

const publicModelInclude = {
  kyc: true,
  categories: { select: { name: true } },
  country: { select: { name: true } },
  city: { select: { name: true } },
  media: { select: { url: true, type: true } },
} as const;

type RawPublicModel = NonNullable<Awaited<ReturnType<typeof prisma.model.findFirst<{ include: typeof publicModelInclude }>>>>;

export interface ModeloPublico {
  id: string;
  fullName: string;
  artisticName: string | null;
  categories: string[];
  genre: string;
  location: string;
  nationality: string | null;
  height: number | null;
  weight: number | null;
  hasVisibleTattoos: boolean | null;
  shirtSize: string | null;
  pantsSize: string | null;
  availableToTravel: boolean;
  hasPassport: boolean;
  hasVisaUS: boolean;
  media: { url: string; type: string }[];
}

function toPublico(m: RawPublicModel): ModeloPublico {
  return {
    id: m.id,
    fullName: [m.firstName, m.lastNameP, m.lastNameM].filter(Boolean).join(" "),
    artisticName: m.artisticName,
    categories: m.categories.map((c) => c.name),
    genre: m.genre,
    location: `${m.city.name}, ${m.country.name}`,
    nationality: m.nationality,
    height: m.height,
    weight: m.weight ? Number(m.weight) : null,
    hasVisibleTattoos: m.hasVisibleTattoos,
    shirtSize: m.shirtSize,
    pantsSize: m.pantsSize,
    availableToTravel: m.availableToTravel,
    hasPassport: m.hasPassport,
    hasVisaUS: m.hasVisaUS,
    media: m.media.map((med) => ({ url: med.url, type: med.type })),
  };
}

const visibleApproved = { kyc: { status: "APPROVED" as const }, isVisible: true };

export async function listVitrinaModelos(): Promise<ModeloPublico[]> {
  const modelos = await prisma.model.findMany({
    where: visibleApproved,
    include: publicModelInclude,
    orderBy: { lastNameP: "asc" },
  });
  return modelos.map(toPublico);
}

export async function getVitrinaModelo(id: string): Promise<ModeloPublico | undefined> {
  const modelo = await prisma.model.findFirst({
    where: { id, ...visibleApproved },
    include: publicModelInclude,
  });
  if (!modelo) return undefined;
  return toPublico(modelo);
}

export async function listDestacados(limit = 4): Promise<ModeloPublico[]> {
  const modelos = await prisma.model.findMany({
    where: visibleApproved,
    include: publicModelInclude,
    orderBy: { lastNameP: "asc" },
    take: limit,
  });
  return modelos.map(toPublico);
}

// ---------- Paquetes públicos ----------

export async function getPaquetePublico(token: string) {
  const pkg = await prisma.package.findUnique({
    where: { publicToken: token },
    include: {
      models: {
        include: {
          categories: { select: { name: true } },
          country: { select: { name: true } },
          city: { select: { name: true } },
        },
      },
    },
  });
  if (!pkg) return null;
  return {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    status: pkg.status,
    models: pkg.models.map((m) => ({
      id: m.id,
      fullName: [m.firstName, m.lastNameP, m.lastNameM].filter(Boolean).join(" "),
      artisticName: m.artisticName,
      categories: m.categories.map((c) => c.name),
      location: `${m.city.name}, ${m.country.name}`,
    })),
  };
}

export interface EventoPortafolio {
  id: string;
  nombre: string;
  tipo: string;
  lugar: string;
  fecha: string;
  clienteNombre: string;
}

export async function listEventosPortafolio(): Promise<EventoPortafolio[]> {
  return eventos
    .filter((e) => e.agencyId === AGENCY_ID && e.estado === "finalizado")
    .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    .map((e) => ({
      id: e.id,
      nombre: e.nombre,
      tipo: e.tipo,
      lugar: e.lugar,
      fecha: e.fechaInicio,
      clienteNombre: clientes.find((c) => c.id === e.clienteId)?.empresa ?? "Cliente de la agencia",
    }));
}
