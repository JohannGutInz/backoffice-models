import { clients, events, AGENCY_ID } from "./mock-data";
import { prisma } from "@/db";

// Public boundary. Only returns models with approved KYC. No private data.

const publicModelInclude = {
  kyc: true,
  categories: { select: { name: true } },
  activities: { select: { name: true } },
  country: { select: { name: true } },
  city: { select: { name: true } },
} as const;

type RawPublicModel = NonNullable<Awaited<ReturnType<typeof prisma.model.findFirst<{ include: typeof publicModelInclude }>>>>;

export interface PublicModel {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  categories: string[];
  activities: string[];
  genre: string;
  location: string;
  featured: boolean;
}

function toPublicModel(m: RawPublicModel): PublicModel {
  return {
    id: m.id,
    firstName: m.firstName,
    paternalLastName: m.paternalLastName,
    maternalLastName: m.maternalLastName,
    categories: m.categories.map((c) => c.name),
    activities: m.activities.map((a) => a.name),
    genre: m.genre,
    location: `${m.city.name}, ${m.country.name}`,
    featured: false,
  };
}

export async function listPublicModels(): Promise<PublicModel[]> {
  const models = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: publicModelInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
  return models.map(toPublicModel);
}

export async function getPublicModel(id: string): Promise<PublicModel | undefined> {
  const model = await prisma.model.findFirst({
    where: { id, kyc: { status: "APPROVED" } },
    include: publicModelInclude,
  });
  if (!model) return undefined;
  return toPublicModel(model);
}

export async function listFeaturedModels(limit = 4): Promise<PublicModel[]> {
  const models = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: publicModelInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
    take: limit,
  });
  return models.map(toPublicModel);
}

export interface PortfolioEvent {
  id: string;
  name: string;
  type: string;
  venue: string;
  date: string;
  clientName: string;
}

export async function listPortfolioEvents(): Promise<PortfolioEvent[]> {
  return events
    .filter((e) => e.agencyId === AGENCY_ID && e.status === "finalizado")
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      venue: e.venue,
      date: e.startDate,
      clientName: clients.find((c) => c.id === e.clientId)?.company ?? "Cliente de la agencia",
    }));
}
