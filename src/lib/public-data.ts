import { prisma } from "@/db";
import {
  calculateAge,
  getMainPhotoUrl,
  getGalleryVideos,
  getBookPhotos,
  getCasualPhotos,
  getEventPhotos,
  getCampaignVideoLinks,
} from "./utils";
import { signAssetUrls } from "./storage";

// Public boundary. Only returns models with approved KYC. No private data.

const publicModelInclude = {
  kyc: true,
  categories: { select: { name: true } },
  activities: { select: { name: true } },
  country: { select: { name: true } },
  nationality: { select: { demonym: true } },
  city: { select: { name: true } },
  assets: true,
  media: true,
} as const;

type RawPublicModel = NonNullable<Awaited<ReturnType<typeof prisma.model.findFirst<{ include: typeof publicModelInclude }>>>>;

export interface PublicModel {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  mainPhotoUrl: string | null;
  photoUrls: string[];
  casualPhotoUrls: string[];
  eventPhotoUrls: string[];
  videoUrls: string[];
  categories: string[];
  activities: string[];
  genre: string;
  location: string;
  countryName: string;
  cityName: string;
  nationality: string;
  age: number;
  height: number | null;
  currentWeight: number | null;
  hasVisibleTattoos: boolean;
  shirtSize: string | null;
  pantsSizeScale: string | null;
  pantsSize: string | null;
  travelAvailability: boolean;
  hasPassport: boolean;
  hasVisa: boolean;
  kycStatus: string;
  featured: boolean;
  campaignVideoLinks: string[];
  createdAt: Date;
}

async function toPublicModel(m: RawPublicModel): Promise<PublicModel> {
  const [assets, media] = await Promise.all([signAssetUrls(m.assets), signAssetUrls(m.media)]);
  return {
    id: m.id,
    firstName: m.firstName,
    paternalLastName: m.paternalLastName,
    maternalLastName: m.maternalLastName,
    mainPhotoUrl: getMainPhotoUrl(assets),
    photoUrls: getBookPhotos(media),
    casualPhotoUrls: getCasualPhotos(media),
    eventPhotoUrls: getEventPhotos(media),
    videoUrls: getGalleryVideos(assets),
    categories: m.categories.map((c) => c.name),
    activities: m.activities.map((a) => a.name),
    genre: m.genre,
    location: `${m.city.name}, ${m.country.name}`,
    countryName: m.country.name,
    cityName: m.city.name,
    nationality: m.nationality.demonym,
    age: calculateAge(m.birthDate),
    height: m.height,
    currentWeight: m.currentWeight,
    hasVisibleTattoos: m.hasVisibleTattoos,
    shirtSize: m.shirtSize,
    pantsSizeScale: m.pantsSizeScale,
    pantsSize: m.pantsSize,
    travelAvailability: m.travelAvailability,
    hasPassport: m.hasPassport,
    hasVisa: m.hasVisa,
    kycStatus: m.kyc.status,
    featured: false,
    campaignVideoLinks: getCampaignVideoLinks(media),
    createdAt: m.createdAt,
  };
}

export async function listPublicModels(): Promise<PublicModel[]> {
  const models = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" }, hiddenFromCatalog: false },
    include: publicModelInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
  return Promise.all(models.map(toPublicModel));
}

export async function getPublicModel(id: string): Promise<PublicModel | undefined> {
  const model = await prisma.model.findFirst({
    where: { id, kyc: { status: "APPROVED" }, hiddenFromCatalog: false },
    include: publicModelInclude,
  });
  if (!model) return undefined;
  return toPublicModel(model);
}

export async function listFeaturedModels(limit = 4): Promise<PublicModel[]> {
  const models = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" }, hiddenFromCatalog: false },
    include: publicModelInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return Promise.all(models.map(toPublicModel));
}

// ---------- Eventos carousel (landing) ----------

export interface EventoDestacado {
  id: string;
  imageUrl: string;
  alt: string;
}

// Backed by the EventoFoto table, managed from /app/eventos (backoffice).
// Photos are stored as bare public URLs (uploadPublicImage in storage.ts),
// not signed — no signAssetUrls() step needed here. EventosCarrusel didn't
// change its rendering, just gained a real per-photo `alt` (previously a
// fixed "Evento realizado por {agencia}" string).
export async function listEventosDestacados(): Promise<EventoDestacado[]> {
  const fotos = await prisma.eventoFoto.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
    // The 12-photo cap is enforced when publishing (toggleEventoFotoPublishedAction
    // in actions.ts) — this `take` is just defense in depth, not the source of truth.
    take: 12,
  });
  return fotos.map((foto) => ({ id: foto.id, imageUrl: foto.url, alt: foto.alt }));
}

// ---------- Catalog filter options (real DB, no fixtures) ----------

export async function listPublicCategories() {
  return prisma.category.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listPublicActivities() {
  return prisma.activity.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export interface PublicGeografia {
  countries: { id: string; name: string }[];
  states: { id: string; name: string; countryId: string }[];
  municipalities: { id: string; name: string; stateId: string }[];
}

export async function listPublicGeografia(): Promise<PublicGeografia> {
  const [countries, states, municipalities] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.state.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, countryId: true } }),
    prisma.municipality.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, stateId: true } }),
  ]);
  return { countries, states, municipalities };
}

export interface PortfolioEntryPublico {
  id: string;
  marca: string;
  fecha: string;
  lugar: string;
  fotos: { url: string; isPortada: boolean }[];
}

export async function listPortfolioEntradas(): Promise<PortfolioEntryPublico[]> {
  return [];
}

export interface PortfolioEvent {
  id: string;
  name: string;
  type: string;
  venue: string;
  date: string;
  clientName: string;
}

// The mock AgencyEvent/Client fixtures this used to read from were removed
// when the admin bookings/clientes modules were deleted (their concept of
// "evento" is now EventoFoto — a marketing photo, not a booking). This public
// page (src/app/(public)/portafolio) still exists and is footer-linked, but
// has no real data source yet; stubbed to empty like listPortfolioEntradas
// above until it's redesigned around EventoFoto or removed.
export async function listPortfolioEvents(): Promise<PortfolioEvent[]> {
  return [];
}

// ---------- Package proposal (real DB) ----------

export interface PaquetePublicoModel {
  id: string;
  fullName: string;
  mainPhotoUrl: string | null;
  categories: string[];
  activities: string[];
  location: string;
  height: number | null;
  currentWeight: number | null;
  genre: string;
}

export interface PaquetePublico {
  name: string;
  description: string | undefined;
  models: PaquetePublicoModel[];
}

export async function getPaquetePublico(token: string): Promise<PaquetePublico | null> {
  const pkg = await prisma.package.findUnique({
    where: { token },
    include: {
      models: {
        include: {
          categories: { select: { name: true } },
          activities: { select: { name: true } },
          country: { select: { name: true } },
          city: { select: { name: true } },
          assets: true,
        },
      },
    },
  });
  if (!pkg) return null;
  return {
    name: pkg.name,
    description: pkg.description ?? undefined,
    models: await Promise.all(
      pkg.models.map(async (m) => ({
        id: m.id,
        fullName: `${m.firstName} ${m.paternalLastName}`,
        mainPhotoUrl: getMainPhotoUrl(await signAssetUrls(m.assets)),
        categories: m.categories.map((c) => c.name),
        activities: m.activities.map((a) => a.name),
        location: `${m.city.name}, ${m.country.name}`,
        height: m.height,
        currentWeight: m.currentWeight,
        genre: m.genre,
      })),
    ),
  };
}

// ---------- Convocatorias públicas ----------

export async function listPublicConvocatorias() {
  return prisma.convocatoria.findMany({
    where: { status: "OPEN" },
    orderBy: { fechaEvento: "asc" },
    select: {
      id: true,
      titulo: true,
      ciudad: true,
      tipo: true,
      fechaEvento: true,
      horario: true,
      lugar: true,
      pago: true,
      whatsappNumber: true,
      publishedAt: true,
    },
  });
}

export async function getPublicConvocatoria(id: string) {
  return prisma.convocatoria.findFirst({
    where: { id, status: "OPEN" },
  });
}
