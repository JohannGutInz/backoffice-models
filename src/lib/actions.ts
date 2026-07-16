"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";
import { siteSettings, models, registrationApplications } from "./mock-data";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./session";
import { toDateKey } from "./utils";
import { emailClientContact } from "./email";
import { APP_ROUTE } from "./routes";
import { ownModelProfileSchema, modelEditSchema } from "./schemas";
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
import { UserRole, AssetType } from "@/generated/prisma/enums";
import { getMainPhotoUrl, getGalleryPhotos, getGalleryVideos } from "./utils";

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

  redirect(user.role === "MODEL" ? APP_ROUTE.app.model.profile : APP_ROUTE.app.dashboard.index);
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
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { status: "error", message: "Ya existe un registro con ese correo electrónico." };
  }

  const hashedPassword = await hashPassword(data.password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        username: `${data.firstName} ${data.paternalLastName}`,
        hashedPassword,
        role: UserRole.MODEL,
      },
    });
    const kyc = await tx.kyc.create({ data: {} });
    await tx.model.create({
      data: {
        firstName: data.firstName,
        paternalLastName: data.paternalLastName,
        maternalLastName: data.maternalLastName || null,
        email: data.email,
        phone: data.phone,
        birthDate: new Date(data.birthDate),
        genre: data.gender,
        countryId: data.countryId,
        nationalityId: data.nationalityId,
        cityId: data.cityId,
        kycId: kyc.id,
        userId: user.id,
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
      },
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

async function deleteRemovedAssets(oldUrls: string[], newUrls: string[]) {
  const removed = oldUrls.filter((url) => !newUrls.includes(url));
  await Promise.all(
    removed.map(async (url) => {
      const key = keyFromObjectUrl(url);
      if (!key) {
        console.warn("[deleteRemovedAssets] URL did not match bucket prefix, skipped delete", url);
        return;
      }
      await deleteObject(key).catch((err) => {
        console.error("[deleteRemovedAssets] failed to delete", key, err);
      });
    }),
  );
}

function assetRows(modelId: string, type: AssetType, urls: string[]) {
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

  const newMainPhoto = result.data.mainPhotoUrl || null;
  const newPhotos = result.data.photoUrls;
  const newVideos = result.data.videoUrls;

  const currentModel = await prisma.model.findUnique({
    where: { userId: session.sub },
    select: { id: true, kycId: true, kyc: { select: { status: true } }, assets: true },
  });
  if (!currentModel) redirect(APP_ROUTE.app.login.index);

  const currentMainPhoto = getMainPhotoUrl(currentModel.assets);
  const currentPhotos = getGalleryPhotos(currentModel.assets);
  const currentVideos = getGalleryVideos(currentModel.assets);

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
        activities: { set: result.data.activityIds.map((id) => ({ id })) },
      },
    }),
    prisma.asset.deleteMany({ where: { modelId: currentModel.id } }),
    prisma.asset.createMany({
      data: [
        ...assetRows(currentModel.id, AssetType.MAIN_PHOTO, newMainPhoto ? [newMainPhoto] : []),
        ...assetRows(currentModel.id, AssetType.PHOTO, newPhotos),
        ...assetRows(currentModel.id, AssetType.VIDEO, newVideos),
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
  await deleteRemovedAssets(currentPhotos, newPhotos);
  await deleteRemovedAssets(currentVideos, newVideos);

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

  await prisma.model.update({
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
      categories: { set: result.data.categoryIds.map((id) => ({ id })) },
      activities: { set: result.data.activityIds.map((id) => ({ id })) },
    },
  });

  revalidatePath(`${APP_ROUTE.app.models.index}/${modelId}`);
  revalidatePath(APP_ROUTE.app.models.index);

  return { status: "success", message: "Modelo actualizado." };
}

// ---------- Eventos (stub actions — pending full implementation) ----------

export async function crearEventoAction(_data: unknown): Promise<ActionState & { eventoId?: string }> {
  return { status: "error", message: "Not implemented" };
}

export async function editarEventoAction(_id: string, _data: unknown): Promise<ActionState> {
  return { status: "error", message: "Not implemented" };
}

// ---------- Paquetes (stub actions) ----------

export async function crearPaqueteAction(_data: unknown): Promise<ActionState & { paqueteId?: string }> {
  return { status: "error", message: "Not implemented" };
}

export async function agregarModeloAPaqueteAction(_paqueteId: string, _modeloId: string): Promise<void> {}

export async function quitarModeloDelPaqueteAction(_paqueteId: string, _modeloId: string): Promise<void> {}

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

export async function cambiarStatusPaqueteAction(
  _paqueteId: string,
  _status: "DRAFT" | "SENT" | "CLOSED",
): Promise<void> {}

export async function crearModeloAdminAction(
  _data: unknown,
): Promise<ActionState & { modelId?: string }> {
  return { status: "error", message: "Not implemented" };
}
