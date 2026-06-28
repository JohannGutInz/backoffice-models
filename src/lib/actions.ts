"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";
import { configuracionSitio, modelos, solicitudesRegistro } from "./mock-data";
import { SESSION_COOKIE, createSessionToken } from "./session";
import { toDateKey } from "./utils";
import { emailContactoCliente } from "./email";
import { APP_ROUTE } from "./routes";
import z from "zod";
import type {
  LoginData,
  ContactoData,
  CategoryData,
  ConfiguracionData,
  ReenviarData,
  RegistroActionData,
} from "./schemas";

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ---------- Sesión de staff (backoffice) ----------

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
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(APP_ROUTE.app.dashboard.index);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect(APP_ROUTE.app.login.index);
}

function randomToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------- Auto-registro público ----------

export async function submitRegistroAction(data: RegistroActionData): Promise<ActionState> {
  const existing = await prisma.model.findUnique({ where: { email: data.correo } });
  if (existing) {
    return { status: "error", message: "Ya existe un registro con ese correo electrónico." };
  }

  await prisma.$transaction(async (tx) => {
    const kyc = await tx.kyc.create({ data: {} });
    await tx.model.create({
      data: {
        fullName: data.nombreCompleto,
        email: data.correo,
        phone: data.telefono,
        birthDate: new Date(data.fechaNacimiento),
        genre: data.genero,
        countryId: data.countryId,
        cityId: data.cityId,
        kycId: kyc.id,
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
      },
    });
  });

  return {
    status: "success",
    message: "¡Gracias! Recibimos tu información y nuestro equipo la revisará pronto. Te avisaremos por correo.",
  };
}

// Edición + reenvío desde el enlace temporal por token (vuelve a "pendiente").
export async function reenviarSolicitudAction(token: string, data: ReenviarData): Promise<ActionState> {
  const solicitud = solicitudesRegistro.find((s) => s.tokenRevision === token);
  if (!solicitud) return { status: "error", message: "Enlace inválido." };

  solicitud.nombreCompleto = data.nombreCompleto;
  solicitud.correo = data.correo;
  solicitud.telefono = data.telefono;
  solicitud.estado = "pendiente";
  solicitud.actualizadoEn = toDateKey(new Date());

  revalidatePath("/moderacion");
  revalidatePath(`/retro/${token}`);

  return { status: "success", message: "¡Listo! Reenviamos tu información actualizada para una nueva revisión." };
}

// ---------- KYC (moderación real) ----------

const moderarKycSchema = z.object({
  modelId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUIRES_CHANGES"]),
  comment: z.string().max(2000).optional(),
  internalNote: z.string().max(2000).optional(),
});

export async function moderarKycAction(
  modelId: string,
  decision: "APPROVED" | "REJECTED" | "REQUIRES_CHANGES",
  formData: FormData,
) {
  const result = moderarKycSchema.safeParse({
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

// ---------- Catálogos (categorías) ----------

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

// ---------- Configuración del sitio (backoffice) ----------

export async function guardarConfiguracionSitioAction(data: ConfiguracionData): Promise<void> {
  configuracionSitio.nombreAgencia = data.nombreAgencia;
  configuracionSitio.colorPrimario = data.colorPrimario;
  configuracionSitio.heroTitulo = data.heroTitulo;
  configuracionSitio.heroSubtitulo = data.heroSubtitulo;

  revalidatePath("/configuracion");
  revalidatePath("/");
  revalidatePath("/talentos");
  revalidatePath("/eventos");
  revalidatePath("/contacto");
}

export async function toggleRegistroPublicoAction(activo: boolean) {
  configuracionSitio.registroPublicoActivo = activo;
  revalidatePath("/configuracion");
  revalidatePath("/");
}

export async function regenerarLinkRegistroAction() {
  configuracionSitio.registroLinkSlug = `registro-glamour-${Math.random().toString(36).slice(2, 8)}`;
  revalidatePath("/configuracion");
  revalidatePath("/");
  return configuracionSitio.registroLinkSlug;
}

export async function toggleVisibilidadLandingAction(modeloId: string, visible: boolean) {
  const modelo = modelos.find((m) => m.id === modeloId);
  if (!modelo) return;
  modelo.publicoEnLanding = visible;
  revalidatePath(`/modelos/${modeloId}`);
  revalidatePath("/talentos");
}

// ---------- Contacto de clientes (landing pública) ----------

export async function submitContactoAction(data: ContactoData): Promise<ActionState> {
  await emailContactoCliente({
    nombre: data.nombre,
    empresa: data.empresa ?? "",
    correo: data.correo,
    mensaje: data.mensaje,
  });

  return { status: "success", message: "¡Gracias por tu mensaje! Te responderemos a la brevedad." };
}
