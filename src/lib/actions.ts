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
import { ownModelProfileSchema } from "./schemas";
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
} from "./schemas";
import { UserRole } from "@/generated/prisma/enums";

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
        username: data.fullName,
        hashedPassword,
        role: UserRole.MODEL,
      },
    });
    const kyc = await tx.kyc.create({ data: {} });
    await tx.model.create({
      data: {
        fullName: data.fullName,
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

  const newPhoto = result.data.mainPhotoUrl || null;

  const currentModel = await prisma.model.findUnique({
    where: { userId: session.sub },
    select: { mainPhotoUrl: true },
  });

  await prisma.model.update({
    where: { userId: session.sub },
    data: { phone: result.data.phone, mainPhotoUrl: newPhoto },
  });

  if (currentModel?.mainPhotoUrl && currentModel.mainPhotoUrl !== newPhoto) {
    const oldKey = keyFromObjectUrl(currentModel.mainPhotoUrl);
    if (oldKey) {
      await deleteObject(oldKey).catch((err) => {
        console.error("[updateOwnModelProfileAction] failed to delete old photo", oldKey, err);
      });
    } else {
      console.warn("[updateOwnModelProfileAction] old photo URL did not match bucket prefix, skipped delete", currentModel.mainPhotoUrl);
    }
  }

  revalidatePath(APP_ROUTE.app.model.profile);

  return { status: "success", message: "Perfil actualizado." };
}
