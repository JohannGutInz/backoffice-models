import { clientes, eventos, AGENCY_ID } from "./mock-data";
import { prisma } from "@/db";

// Frontera pública. Solo devuelve modelos con KYC aprobado. Sin datos privados.

const publicModelInclude = {
  kyc: true,
  categories: { select: { name: true } },
  country: { select: { name: true } },
  city: { select: { name: true } },
} as const;

type RawPublicModel = NonNullable<Awaited<ReturnType<typeof prisma.model.findFirst<{ include: typeof publicModelInclude }>>>>;

export interface ModeloPublico {
  id: string;
  fullName: string;
  categories: string[];
  genre: string;
  location: string;
  destacado: boolean;
}

function toPublico(m: RawPublicModel): ModeloPublico {
  return {
    id: m.id,
    fullName: m.fullName,
    categories: m.categories.map((c) => c.name),
    genre: m.genre,
    location: `${m.city.name}, ${m.country.name}`,
    destacado: false,
  };
}

export async function listVitrinaModelos(): Promise<ModeloPublico[]> {
  const modelos = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: publicModelInclude,
    orderBy: { fullName: "asc" },
  });
  return modelos.map(toPublico);
}

export async function getVitrinaModelo(id: string): Promise<ModeloPublico | undefined> {
  const modelo = await prisma.model.findFirst({
    where: { id, kyc: { status: "APPROVED" } },
    include: publicModelInclude,
  });
  if (!modelo) return undefined;
  return toPublico(modelo);
}

export async function listDestacados(limit = 4): Promise<ModeloPublico[]> {
  const modelos = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: publicModelInclude,
    orderBy: { fullName: "asc" },
    take: limit,
  });
  return modelos.map(toPublico);
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
