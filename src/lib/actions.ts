"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";
import { siteSettings, models, registrationApplications } from "./mock-data";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./session";
import { toDateKey } from "./utils";
import { emailClientContact, emailConvocatoriaPublicada } from "./email";
import { APP_ROUTE } from "./routes";
import { ownModelProfileSchema, modelEditSchema, registrationActionSchema, convocatoriaSchema } from "./schemas";
import type { ConvocatoriaFormData } from "./schemas";
import { deleteObject, keyFromObjectUrl } from "./storage";
import z from "zod";
import type {
  LoginData,
  ContactData,
  CategoryData,
  SettingsData,
  ResendApplicationData,
  RegistrationActionData,
  OwnModelProfileData,
  ModelEditData,
} from "./schemas";
import { UserRole, AssetType, MediaType } from "@/generated/prisma/enums";
import {
  getMainPhotoUrl,
  getGalleryVideos,
  getCasualPhotos,
  getBookPhotos,
  getEventPhotos,
} from "./utils";

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ---------- Staff session (backoffice) ----------

export async function loginAction(data: LoginData): Promise<ActionState> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const passwordMatches = await bcrypt.compare(data.password, user.hashedPassword);
  if (!passwordMatches) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const sessionToken = await createSessionToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(user.role === "MODEL" ? APP_ROUTE.app.model.profile : APP_ROUTE.app.models.index);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect(APP_ROUTE.app.login.index);
}

function randomToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- Public self-registration ----------

export async function submitRegistrationAction(data: RegistrationActionData): Promise<ActionState> {
  const parsed = registrationActionSchema.safeParse(data);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    console.error("[registro] validación fallida:", fields);
    return { status: "error", message: `Datos inválidos: ${fields}` };
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    return { status: "error", message: "Ya existe un registro con ese correo electrónico." };
  }

  const hashedPassword = await hashPassword(d.password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: d.email,
        username: `${d.firstName} ${d.paternalLastName}`,
        hashedPassword,
        role: UserRole.MODEL,
      },
    });
    const kyc = await tx.kyc.create({ data: {} });
    const model = await tx.model.create({
      data: {
        firstName: d.firstName,
        paternalLastName: d.paternalLastName,
        maternalLastName: d.maternalLastName || null,
        email: d.email,
        phone: d.phone,
        birthDate: new Date(d.birthDate),
        genre: d.gender,
        countryId: d.countryId,
        nationalityId: d.nationalityId,
        cityId: d.cityId,
        kycId: kyc.id,
        userId: user.id,
        height: d.height,
        currentWeight: d.currentWeight,
        hasVisibleTattoos: d.hasVisibleTattoos,
        shirtSize: d.shirtSize,
        pantsSizeScale: d.pantsSizeScale,
        pantsSize: d.pantsSize,
        travelAvailability: d.travelAvailability,
        hasPassport: d.hasPassport,
        hasVisa: d.hasVisa,
        categories: { connect: d.categoryIds.map((id) => ({ id })) },
      },
    });

    const mainPhoto = d.mainPhotoUrl ? toAssetKey(d.mainPhotoUrl) : null;
    const presentationVideo = d.presentationVideoUrl ? toAssetKey(d.presentationVideoUrl) : null;
    await tx.asset.createMany({
      data: [
        ...assetRows(model.id, AssetType.MAIN_PHOTO, mainPhoto ? [mainPhoto] : []),
        ...assetRows(model.id, AssetType.VIDEO, presentationVideo ? [presentationVideo] : []),
      ],
    });
    await tx.modelMedia.createMany({
      data: [
        ...mediaRows(model.id, MediaType.PHOTO_CASUAL, d.casualPhotoUrls.map(toAssetKey)),
        ...mediaRows(model.id, MediaType.PHOTO_BOOK, d.bookPhotoUrls.map(toAssetKey)),
        ...mediaRows(model.id, MediaType.PHOTO_EVENT, d.eventPhotoUrls.map(toAssetKey)),
        ...mediaRows(model.id, MediaType.VIDEO_LINK, d.campaignVideoLinks.map(toAssetKey)),
      ],
    });
  });

  return {
    status: "success",
    message: "¡Gracias! Recibimos tu información y nuestro equipo la revisará pronto. Te avisaremos por correo.",
  };
}

// Edit + resend from the temporary token link (goes back to "pendiente").
export async function resendApplicationAction(token: string, data: ResendApplicationData): Promise<ActionState> {
  const application = registrationApplications.find((s) => s.reviewToken === token);
  if (!application) return { status: "error", message: "Enlace inválido." };

  application.fullName = data.fullName;
  application.email = data.email;
  application.phone = data.phone;
  application.status = "pendiente";
  application.updatedAt = toDateKey(new Date());

  revalidatePath("/moderacion");
  revalidatePath(`/retro/${token}`);

  return { status: "success", message: "¡Listo! Reenviamos tu información actualizada para una nueva revisión." };
}

// ---------- KYC (real moderation) ----------

const moderateKycSchema = z.object({
  modelId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUIRES_CHANGES"]),
  comment: z.string().max(2000).optional(),
  internalNote: z.string().max(2000).optional(),
});

export async function moderateKycAction(
  modelId: string,
  decision: "APPROVED" | "REJECTED" | "REQUIRES_CHANGES",
  formData: FormData,
) {
  const result = moderateKycSchema.safeParse({
    modelId,
    decision,
    comment: String(formData.get("comment") ?? "").trim() || undefined,
    internalNote: String(formData.get("internalNote") ?? "").trim() || undefined,
  });

  if (!result.success) return;

  const model = await prisma.model.findUnique({
    where: { id: result.data.modelId },
    select: { kycId: true },
  });
  if (!model) return;

  await prisma.kyc.update({
    where: { id: model.kycId },
    data: {
      status: result.data.decision,
      comment: result.data.comment,
      internalNote: result.data.internalNote,
      reviewedAt: new Date(),
      ...(result.data.decision === "REJECTED" && { rejectedAt: new Date() }),
    },
  });

  revalidatePath("/app/moderacion");
  revalidatePath(`/app/moderacion/${result.data.modelId}`);
  revalidatePath("/app/dashboard");
}

// ---------- Catalogs (categories) ----------

export async function createCategoryAction(data: CategoryData): Promise<ActionState> {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });
  if (existing) {
    return { status: "error", message: "Ya existe un catálogo con ese nombre." };
  }

  await prisma.category.create({ data: { name: data.name } });
  revalidatePath("/app/catalogs");

  return { status: "success", message: "Catálogo creado." };
}

export async function toggleCategoryEnabledAction(id: string, enabled: boolean): Promise<void> {
  await prisma.category.update({ where: { id }, data: { enabled } });
  revalidatePath("/app/catalogs");
}

// ---------- Catalogs (activities) ----------

export async function createActivityAction(data: CategoryData): Promise<ActionState> {
  const existing = await prisma.activity.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });
  if (existing) {
    return { status: "error", message: "Ya existe una actividad con ese nombre." };
  }

  await prisma.activity.create({ data: { name: data.name } });
  revalidatePath("/app/catalogs");

  return { status: "success", message: "Actividad creada." };
}

export async function toggleActivityEnabledAction(id: string, enabled: boolean): Promise<void> {
  await prisma.activity.update({ where: { id }, data: { enabled } });
  revalidatePath("/app/catalogs");
}

// ---------- Site settings (backoffice) ----------

export async function saveSiteSettingsAction(data: SettingsData): Promise<void> {
  siteSettings.agencyName = data.agencyName;
  siteSettings.primaryColor = data.primaryColor;
  siteSettings.heroTitle = data.heroTitle;
  siteSettings.heroSubtitle = data.heroSubtitle;

  revalidatePath("/configuracion");
  revalidatePath("/");
  revalidatePath("/talentos");
  revalidatePath("/eventos");
  revalidatePath("/contacto");
}

export async function togglePublicRegistrationAction(active: boolean) {
  siteSettings.publicRegistrationActive = active;
  revalidatePath("/configuracion");
  revalidatePath("/");
}

export async function regenerateRegistrationLinkAction() {
  siteSettings.registrationLinkSlug = `registro-glamour-${Math.random().toString(36).slice(2, 8)}`;
  revalidatePath("/configuracion");
  revalidatePath("/");
  return siteSettings.registrationLinkSlug;
}

export async function toggleLandingVisibilityAction(modelId: string, visible: boolean) {
  const model = models.find((m) => m.id === modelId);
  if (!model) return;
  model.publicOnLanding = visible;
  revalidatePath(`/modelos/${modelId}`);
  revalidatePath("/talentos");
}

// ---------- Client contact (public landing) ----------

export async function submitContactAction(data: ContactData): Promise<ActionState> {
  await emailClientContact({
    name: data.name,
    company: data.company ?? "",
    email: data.email,
    message: data.message,
  });

  return { status: "success", message: "¡Gracias por tu mensaje! Te responderemos a la brevedad." };
}

// ---------- Model portal (self-service) ----------

async function deleteRemovedAssets(oldKeys: string[], newKeys: string[]) {
  const removed = oldKeys.filter((key) => !newKeys.includes(key));
  await Promise.all(
    removed.map((key) =>
      deleteObject(key).catch((err) => {
        console.error("[deleteRemovedAssets] failed to delete", key, err);
      }),
    ),
  );
}

// Assets submitted from the client are signed GET URLs (bucket is private);
// convert back to bare S3 keys before persisting or diffing.
function toAssetKey(urlOrKey: string): string {
  return keyFromObjectUrl(urlOrKey) ?? urlOrKey;
}

function assetRows(modelId: string, type: AssetType, urls: string[]) {
  return urls.map((url, position) => ({ modelId, type, url, position }));
}

function mediaRows(modelId: string, type: MediaType, urls: string[]) {
  return urls.map((url, position) => ({ modelId, type, url, position }));
}

export async function updateOwnModelProfileAction(data: OwnModelProfileData): Promise<ActionState> {
  const result = ownModelProfileSchema.safeParse(data);
  if (!result.success) {
    return { status: "error", message: "Datos inválidos." };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  if (!session || session.role !== "MODEL") {
    redirect(APP_ROUTE.app.login.index);
  }

  const newMainPhoto = result.data.mainPhotoUrl ? toAssetKey(result.data.mainPhotoUrl) : null;
  const newPresentationVideo = result.data.presentationVideoUrl ? toAssetKey(result.data.presentationVideoUrl) : null;
  const newCasualPhotos = result.data.casualPhotoUrls.map(toAssetKey);
  const newBookPhotos = result.data.bookPhotoUrls.map(toAssetKey);
  const newEventPhotos = result.data.eventPhotoUrls.map(toAssetKey);
  const newCampaignLinks = result.data.campaignVideoLinks.map(toAssetKey);

  const currentModel = await prisma.model.findUnique({
    where: { userId: session.sub },
    select: { id: true, kycId: true, kyc: { select: { status: true } }, assets: true, media: true },
  });
  if (!currentModel) redirect(APP_ROUTE.app.login.index);

  const currentMainPhoto = getMainPhotoUrl(currentModel.assets);
  const currentPresentationVideo = getGalleryVideos(currentModel.assets)[0] ?? null;
  const currentCasualPhotos = getCasualPhotos(currentModel.media);
  const currentBookPhotos = getBookPhotos(currentModel.media);
  const currentEventPhotos = getEventPhotos(currentModel.media);

  await prisma.$transaction([
    prisma.model.update({
      where: { userId: session.sub },
      data: {
        firstName: result.data.firstName,
        paternalLastName: result.data.paternalLastName,
        maternalLastName: result.data.maternalLastName || null,
        phone: result.data.phone,
        height: result.data.height,
        currentWeight: result.data.currentWeight,
        hasVisibleTattoos: result.data.hasVisibleTattoos,
        shirtSize: result.data.shirtSize,
        pantsSizeScale: result.data.pantsSizeScale,
        pantsSize: result.data.pantsSize,
        travelAvailability: result.data.travelAvailability,
        hasPassport: result.data.hasPassport,
        hasVisa: result.data.hasVisa,
        categories: { set: result.data.categoryIds.map((id) => ({ id })) },
      },
    }),
    prisma.asset.deleteMany({ where: { modelId: currentModel.id } }),
    prisma.asset.createMany({
      data: [
        ...assetRows(currentModel.id, AssetType.MAIN_PHOTO, newMainPhoto ? [newMainPhoto] : []),
        ...assetRows(currentModel.id, AssetType.VIDEO, newPresentationVideo ? [newPresentationVideo] : []),
      ],
    }),
    prisma.modelMedia.deleteMany({ where: { modelId: currentModel.id } }),
    prisma.modelMedia.createMany({
      data: [
        ...mediaRows(currentModel.id, MediaType.PHOTO_CASUAL, newCasualPhotos),
        ...mediaRows(currentModel.id, MediaType.PHOTO_BOOK, newBookPhotos),
        ...mediaRows(currentModel.id, MediaType.PHOTO_EVENT, newEventPhotos),
        ...mediaRows(currentModel.id, MediaType.VIDEO_LINK, newCampaignLinks),
      ],
    }),
  ]);

  if (currentModel.kyc.status === "APPROVED") {
    await prisma.kyc.update({
      where: { id: currentModel.kycId },
      data: { status: "PENDING" },
    });
  }

  await deleteRemovedAssets(currentMainPhoto ? [currentMainPhoto] : [], newMainPhoto ? [newMainPhoto] : []);
  await deleteRemovedAssets(
    currentPresentationVideo ? [currentPresentationVideo] : [],
    newPresentationVideo ? [newPresentationVideo] : [],
  );
  await deleteRemovedAssets(currentCasualPhotos, newCasualPhotos);
  await deleteRemovedAssets(currentBookPhotos, newBookPhotos);
  await deleteRemovedAssets(currentEventPhotos, newEventPhotos);

  revalidatePath(APP_ROUTE.app.model.profile);
  revalidatePath("/app/moderacion");
  revalidatePath("/app/dashboard");

  return {
    status: "success",
    message:
      currentModel.kyc.status === "APPROVED"
        ? "Perfil actualizado. Tu KYC vuelve a estar pendiente de aprobación."
        : "Perfil actualizado.",
  };
}

// ---------- Model admin edit ----------

export async function updateModelAttributesAction(modelId: string, data: ModelEditData): Promise<ActionState> {
  const result = modelEditSchema.safeParse(data);
  if (!result.success) {
    return { status: "error", message: "Datos inválidos." };
  }

  const newMainPhoto = result.data.mainPhotoUrl ? toAssetKey(result.data.mainPhotoUrl) : null;
  const newPresentationVideo = result.data.presentationVideoUrl ? toAssetKey(result.data.presentationVideoUrl) : null;
  const newCasualPhotos = result.data.casualPhotoUrls.map(toAssetKey);
  const newBookPhotos = result.data.bookPhotoUrls.map(toAssetKey);
  const newEventPhotos = result.data.eventPhotoUrls.map(toAssetKey);
  const newCampaignLinks = result.data.campaignVideoLinks.map(toAssetKey);

  const currentModel = await prisma.model.findUnique({
    where: { id: modelId },
    select: { assets: true, media: true },
  });
  if (!currentModel) {
    return { status: "error", message: "Modelo no encontrado." };
  }

  const currentMainPhoto = getMainPhotoUrl(currentModel.assets);
  const currentPresentationVideo = getGalleryVideos(currentModel.assets)[0] ?? null;
  const currentCasualPhotos = getCasualPhotos(currentModel.media);
  const currentBookPhotos = getBookPhotos(currentModel.media);
  const currentEventPhotos = getEventPhotos(currentModel.media);

  await prisma.$transaction([
    prisma.model.update({
      where: { id: modelId },
      data: {
        firstName: result.data.firstName,
        paternalLastName: result.data.paternalLastName,
        maternalLastName: result.data.maternalLastName || null,
        phone: result.data.phone,
        height: result.data.height,
        currentWeight: result.data.currentWeight,
        hasVisibleTattoos: result.data.hasVisibleTattoos,
        shirtSize: result.data.shirtSize,
        pantsSizeScale: result.data.pantsSizeScale,
        pantsSize: result.data.pantsSize,
        travelAvailability: result.data.travelAvailability,
        hasPassport: result.data.hasPassport,
        hasVisa: result.data.hasVisa,
        hiddenFromCatalog: result.data.hiddenFromCatalog,
        categories: { set: result.data.categoryIds.map((id) => ({ id })) },
      },
    }),
    prisma.asset.deleteMany({ where: { modelId } }),
    prisma.asset.createMany({
      data: [
        ...assetRows(modelId, AssetType.MAIN_PHOTO, newMainPhoto ? [newMainPhoto] : []),
        ...assetRows(modelId, AssetType.VIDEO, newPresentationVideo ? [newPresentationVideo] : []),
      ],
    }),
    prisma.modelMedia.deleteMany({ where: { modelId } }),
    prisma.modelMedia.createMany({
      data: [
        ...mediaRows(modelId, MediaType.PHOTO_CASUAL, newCasualPhotos),
        ...mediaRows(modelId, MediaType.PHOTO_BOOK, newBookPhotos),
        ...mediaRows(modelId, MediaType.PHOTO_EVENT, newEventPhotos),
        ...mediaRows(modelId, MediaType.VIDEO_LINK, newCampaignLinks),
      ],
    }),
  ]);

  await deleteRemovedAssets(currentMainPhoto ? [currentMainPhoto] : [], newMainPhoto ? [newMainPhoto] : []);
  await deleteRemovedAssets(
    currentPresentationVideo ? [currentPresentationVideo] : [],
    newPresentationVideo ? [newPresentationVideo] : [],
  );
  await deleteRemovedAssets(currentCasualPhotos, newCasualPhotos);
  await deleteRemovedAssets(currentBookPhotos, newBookPhotos);
  await deleteRemovedAssets(currentEventPhotos, newEventPhotos);

  revalidatePath(`${APP_ROUTE.app.models.index}/${modelId}`);
  revalidatePath(APP_ROUTE.app.models.index);

  return { status: "success", message: "Modelo actualizado." };
}

export async function toggleModelVisibilityAction(modelId: string, hiddenFromCatalog: boolean): Promise<ActionState> {
  await prisma.model.update({
    where: { id: modelId },
    data: { hiddenFromCatalog },
  });

  revalidatePath(`${APP_ROUTE.app.models.index}/${modelId}`);
  revalidatePath(APP_ROUTE.app.models.index);

  return { status: "success", message: hiddenFromCatalog ? "Perfil ocultado del catálogo." : "Perfil visible en el catálogo." };
}

// ---------- Eventos (stub actions — pending full implementation) ----------

export async function crearEventoAction(_data: unknown): Promise<ActionState & { eventoId?: string }> {
  return { status: "error", message: "Not implemented" };
}

export async function editarEventoAction(_id: string, _data: unknown): Promise<ActionState> {
  return { status: "error", message: "Not implemented" };
}

// ---------- Convocatorias ----------

export async function crearConvocatoriaAction(data: ConvocatoriaFormData): Promise<ActionState & { id?: string }> {
  const parsed = convocatoriaSchema.safeParse(data);
  if (!parsed.success) {
    return { status: "error", message: "Datos inválidos." };
  }
  const d = parsed.data;
  const conv = await prisma.convocatoria.create({
    data: {
      id: crypto.randomUUID(),
      titulo: d.titulo,
      ciudad: d.ciudad,
      tipo: d.tipo,
      fechaEvento: new Date(d.fechaEvento),
      horario: d.horario,
      lugar: d.lugar,
      funciones: d.funciones,
      pago: d.pago,
      perfil: d.perfil,
      cuerpo: d.cuerpo,
      whatsappNumber: d.whatsappNumber,
    },
  });
  revalidatePath(APP_ROUTE.app.convocatorias.index);
  return { status: "success", message: "Convocatoria creada.", id: conv.id };
}

export async function editarConvocatoriaAction(id: string, data: ConvocatoriaFormData): Promise<ActionState> {
  const parsed = convocatoriaSchema.safeParse(data);
  if (!parsed.success) {
    return { status: "error", message: "Datos inválidos." };
  }
  const d = parsed.data;
  await prisma.convocatoria.update({
    where: { id },
    data: {
      titulo: d.titulo,
      ciudad: d.ciudad,
      tipo: d.tipo,
      fechaEvento: new Date(d.fechaEvento),
      horario: d.horario,
      lugar: d.lugar,
      funciones: d.funciones,
      pago: d.pago,
      perfil: d.perfil,
      cuerpo: d.cuerpo,
      whatsappNumber: d.whatsappNumber,
    },
  });
  revalidatePath(APP_ROUTE.app.convocatorias.index);
  revalidatePath(APP_ROUTE.app.convocatorias.detail(id));
  return { status: "success", message: "Convocatoria actualizada." };
}

export async function publicarConvocatoriaAction(id: string): Promise<void> {
  const conv = await prisma.convocatoria.update({
    where: { id },
    data: { status: "OPEN", publishedAt: new Date() },
  });
  revalidatePath(APP_ROUTE.app.convocatorias.index);
  revalidatePath(APP_ROUTE.app.convocatorias.detail(id));

  const approvedModels = await prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    select: { email: true, firstName: true },
  });
  await Promise.allSettled(approvedModels.map((m) => emailConvocatoriaPublicada(m, conv)));
}

export async function cerrarConvocatoriaAction(id: string): Promise<void> {
  await prisma.convocatoria.update({ where: { id }, data: { status: "CLOSED" } });
  revalidatePath(APP_ROUTE.app.convocatorias.index);
  revalidatePath(APP_ROUTE.app.convocatorias.detail(id));
}

export async function eliminarConvocatoriaAction(id: string): Promise<void> {
  await prisma.convocatoria.delete({ where: { id } });
  revalidatePath(APP_ROUTE.app.convocatorias.index);
  redirect(APP_ROUTE.app.convocatorias.index);
}

// ---------- Paquetes (real) ----------

export async function crearPaqueteAction(data: unknown): Promise<ActionState & { paqueteId?: string }> {
  const parsed = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }).safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };
  const pkg = await prisma.package.create({
    data: {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      description: parsed.data.description,
      token: crypto.randomUUID(),
    },
  });
  revalidatePath(APP_ROUTE.app.packages.index);
  return { status: "success", message: "Paquete creado.", paqueteId: pkg.id };
}

export async function agregarModeloAPaqueteAction(paqueteId: string, modeloId: string): Promise<void> {
  await prisma.package.update({
    where: { id: paqueteId },
    data: { models: { connect: { id: modeloId } } },
  });
  revalidatePath(`${APP_ROUTE.app.packages.index}/${paqueteId}`);
}

export async function quitarModeloDelPaqueteAction(paqueteId: string, modeloId: string): Promise<void> {
  await prisma.package.update({
    where: { id: paqueteId },
    data: { models: { disconnect: { id: modeloId } } },
  });
  revalidatePath(`${APP_ROUTE.app.packages.index}/${paqueteId}`);
}

// ---------- Portafolio (stub actions) ----------

export async function crearPortfolioEntryAction(_data: unknown): Promise<ActionState & { entryId?: string }> {
  return { status: "error", message: "Not implemented" };
}

export async function editarPortfolioEntryAction(_id: string, _data: unknown): Promise<ActionState & { entryId?: string }> {
  return { status: "error", message: "Not implemented" };
}

export async function eliminarPortfolioEntryAction(_id: string): Promise<void> {}

export async function togglePortfolioVisibilidadAction(_id: string, _visible: boolean): Promise<void> {}

export async function marcarEventoCubiertoAction(
  _id: string,
  _cubierto: boolean,
  _modeloId: string | null,
): Promise<void> {}

export async function eliminarEventoAction(_id: string): Promise<void> {}

export async function renombrarPaqueteAction(paqueteId: string, data: unknown): Promise<ActionState> {
  const parsed = z.object({
    name: z.string().min(1, "El nombre del paquete es obligatorio."),
  }).safeParse(data);
  if (!parsed.success) return { status: "error", message: "El nombre del paquete es obligatorio." };

  await prisma.package.update({ where: { id: paqueteId }, data: { name: parsed.data.name } });
  revalidatePath(`${APP_ROUTE.app.packages.index}/${paqueteId}`);
  revalidatePath(APP_ROUTE.app.packages.index);
  return { status: "success", message: "Nombre actualizado." };
}

export async function cambiarStatusPaqueteAction(
  paqueteId: string,
  status: "DRAFT" | "SENT" | "CLOSED",
): Promise<void> {
  await prisma.package.update({ where: { id: paqueteId }, data: { status } });
  revalidatePath(`${APP_ROUTE.app.packages.index}/${paqueteId}`);
  revalidatePath(APP_ROUTE.app.packages.index);
}

// ---------- Convocatorias: marcar vistas desde el portal modelo ----------

export async function marcarConvocatoriasVistaAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;
  if (!session || session.role !== "MODEL") return;

  const model = await prisma.model.findUnique({
    where: { userId: session.sub },
    select: { id: true },
  });
  if (!model) return;

  const open = await prisma.convocatoria.findMany({
    where: { status: "OPEN" },
    select: { id: true },
  });

  await Promise.allSettled(
    open.map((conv) =>
      prisma.convocatoriaVista.upsert({
        where: {
          modeloId_convocatoriaId: {
            modeloId: model.id,
            convocatoriaId: conv.id,
          },
        },
        create: {
          id: crypto.randomUUID(),
          modeloId: model.id,
          convocatoriaId: conv.id,
        },
        update: {},
      }),
    ),
  );

  revalidatePath("/app/modelo/convocatorias");
}

export async function crearModeloAdminAction(
  _data: unknown,
): Promise<ActionState & { modelId?: string }> {
  return { status: "error", message: "Not implemented" };
}
