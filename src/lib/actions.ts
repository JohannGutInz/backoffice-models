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
  NuevoModeloAdminActionData,
  CrearPaqueteData,
  EventoFormData,
  PortfolioEntryData,
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
        firstName: data.nombres,
        lastNameP: data.apellidoPaterno,
        lastNameM: data.apellidoMaterno ?? null,
        email: data.correo,
        phone: data.telefono,
        birthDate: new Date(data.fechaNacimiento),
        genre: data.genero,
        countryId: data.countryId,
        cityId: data.cityId,
        kycId: kyc.id,
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
        artisticName: data.artisticName || null,
        nationality: data.nationality || null,
        height: data.height ? parseInt(data.height, 10) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        hasVisibleTattoos: data.hasVisibleTattoos,
        shirtSize: data.shirtSize || null,
        pantsSize: data.pantsSize || null,
        availableToTravel: data.availableToTravel,
        hasPassport: data.hasPassport,
        hasVisaUS: data.hasVisaUS,
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

// ---------- Alta manual de modelo (backoffice admin) ----------

export async function crearModeloAdminAction(
  data: NuevoModeloAdminActionData,
): Promise<ActionState & { modelId?: string }> {
  const existing = await prisma.model.findUnique({ where: { email: data.email } });
  if (existing) {
    return { status: "error", message: "Ya existe un modelo con ese correo electrónico." };
  }

  const modelId = await prisma.$transaction(async (tx) => {
    const kyc = await tx.kyc.create({
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    const model = await tx.model.create({
      data: {
        firstName: data.firstName,
        lastNameP: data.lastNameP,
        lastNameM: data.lastNameM || null,
        artisticName: data.artisticName || null,
        email: data.email,
        phone: data.phone,
        birthDate: new Date(data.fechaNacimiento),
        genre: data.genre,
        nationality: data.nationality || null,
        height: data.height ? parseInt(data.height, 10) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        hasVisibleTattoos: data.hasVisibleTattoos ?? null,
        shirtSize: data.shirtSize || null,
        pantsSize: data.pantsSize || null,
        availableToTravel: data.availableToTravel ?? false,
        hasPassport: data.hasPassport ?? false,
        hasVisaUS: data.hasVisaUS ?? false,
        countryId: data.countryId,
        cityId: data.cityId,
        kycId: kyc.id,
        categories: data.categoryIds?.length
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    return model.id;
  });

  revalidatePath("/app/modelos");
  revalidatePath("/app/moderacion");

  return { status: "success", message: "Modelo creado.", modelId };
}

export async function toggleVisibilidadLandingAction(modeloId: string, visible: boolean) {
  await prisma.model.update({
    where: { id: modeloId },
    data: { isVisible: visible },
  });
  revalidatePath(`/app/modelos/${modeloId}`);
  revalidatePath("/talentos");
}

// ---------- Paquetes ----------

export async function crearPaqueteAction(data: CrearPaqueteData): Promise<ActionState & { paqueteId?: string }> {
  const pkg = await prisma.package.create({
    data: { name: data.name, description: data.description || null },
  });
  revalidatePath("/app/paquetes");
  return { status: "success", message: "Paquete creado.", paqueteId: pkg.id };
}

export async function agregarModeloAPaqueteAction(paqueteId: string, modeloId: string) {
  await prisma.package.update({
    where: { id: paqueteId },
    data: { models: { connect: { id: modeloId } } },
  });
  revalidatePath(`/app/paquetes/${paqueteId}`);
}

export async function quitarModeloDelPaqueteAction(paqueteId: string, modeloId: string) {
  await prisma.package.update({
    where: { id: paqueteId },
    data: { models: { disconnect: { id: modeloId } } },
  });
  revalidatePath(`/app/paquetes/${paqueteId}`);
}

export async function cambiarStatusPaqueteAction(paqueteId: string, status: "DRAFT" | "SENT" | "CLOSED") {
  await prisma.package.update({ where: { id: paqueteId }, data: { status } });
  revalidatePath(`/app/paquetes/${paqueteId}`);
  revalidatePath("/app/paquetes");
}

// ---------- Eventos ----------

function eventoFormToDb(data: EventoFormData) {
  if (data.isRecurring) {
    const startAt = new Date(`${data.rangeStart}T${data.dailyStartTime}:00`);
    const endAt = new Date(`${data.rangeEnd}T${data.dailyEndTime}:00`);
    return {
      startAt,
      endAt,
      recurringDays: data.recurringDays,
      dailyStartTime: data.dailyStartTime!,
      dailyEndTime: data.dailyEndTime!,
    };
  } else {
    const startAt = new Date(`${data.startDate}T${data.startTime}:00`);
    const endAt = new Date(`${data.endDate}T${data.endTime}:00`);
    return { startAt, endAt, recurringDays: [], dailyStartTime: null, dailyEndTime: null };
  }
}

export async function crearEventoAction(data: EventoFormData): Promise<ActionState & { eventoId?: string }> {
  const db = eventoFormToDb(data);
  if (db.endAt <= db.startAt) {
    return { status: "error", message: "La fecha de fin debe ser posterior al inicio." };
  }
  const evento = await prisma.evento.create({
    data: { nombre: data.nombre, notas: data.notas || null, ...db },
  });
  revalidatePath("/app/eventos");
  revalidatePath("/app/calendario");
  return { status: "success", message: "Evento creado.", eventoId: evento.id };
}

export async function editarEventoAction(
  eventoId: string,
  data: EventoFormData,
): Promise<ActionState> {
  const db = eventoFormToDb(data);
  if (db.endAt <= db.startAt) {
    return { status: "error", message: "La fecha de fin debe ser posterior al inicio." };
  }
  await prisma.evento.update({
    where: { id: eventoId },
    data: { nombre: data.nombre, notas: data.notas || null, ...db },
  });
  revalidatePath(`/app/eventos/${eventoId}`);
  revalidatePath("/app/eventos");
  revalidatePath("/app/calendario");
  return { status: "success", message: "Evento actualizado." };
}

export async function marcarEventoCubiertoAction(
  eventoId: string,
  cubierto: boolean,
  modeloId?: string | null,
) {
  await prisma.evento.update({
    where: { id: eventoId },
    data: { cubierto, modeloId: cubierto ? (modeloId ?? null) : null },
  });
  revalidatePath(`/app/eventos/${eventoId}`);
  revalidatePath("/app/eventos");
  revalidatePath("/app/calendario");
}

export async function eliminarEventoAction(eventoId: string) {
  await prisma.evento.delete({ where: { id: eventoId } });
  revalidatePath("/app/eventos");
  revalidatePath("/app/calendario");
  redirect(APP_ROUTE.app.eventos.index);
}

// ---------- Portafolio ----------

function fotosCreateInput(fotos: PortfolioEntryData["fotos"]) {
  const valid = fotos.filter((f) => f.url.trim());
  // ensure exactly one portada
  const hasPortada = valid.some((f) => f.isPortada);
  return valid.map((f, i) => ({
    url: f.url.trim(),
    isPortada: hasPortada ? f.isPortada : i === 0,
    orden: f.orden,
  }));
}

export async function crearPortfolioEntryAction(
  data: PortfolioEntryData,
): Promise<ActionState & { entryId?: string }> {
  const entry = await prisma.portfolioEntry.create({
    data: {
      marca: data.marca,
      fecha: data.fecha,
      lugar: data.lugar,
      isVisible: data.isVisible,
      fotos: { create: fotosCreateInput(data.fotos) },
    },
  });
  revalidatePath("/app/portafolio");
  revalidatePath("/");
  revalidatePath("/portafolio");
  return { status: "success", message: "Entrada creada.", entryId: entry.id };
}

export async function editarPortfolioEntryAction(
  entryId: string,
  data: PortfolioEntryData,
): Promise<ActionState> {
  await prisma.$transaction([
    prisma.portfolioFoto.deleteMany({ where: { entryId } }),
    prisma.portfolioEntry.update({
      where: { id: entryId },
      data: {
        marca: data.marca,
        fecha: data.fecha,
        lugar: data.lugar,
        isVisible: data.isVisible,
        fotos: { create: fotosCreateInput(data.fotos) },
      },
    }),
  ]);
  revalidatePath(`/app/portafolio/${entryId}`);
  revalidatePath("/app/portafolio");
  revalidatePath("/");
  revalidatePath("/portafolio");
  return { status: "success", message: "Entrada actualizada." };
}

export async function eliminarPortfolioEntryAction(entryId: string) {
  await prisma.portfolioEntry.delete({ where: { id: entryId } });
  revalidatePath("/app/portafolio");
  revalidatePath("/");
  revalidatePath("/portafolio");
  redirect(APP_ROUTE.app.portafolio.index);
}

export async function togglePortfolioVisibilidadAction(entryId: string, visible: boolean) {
  await prisma.portfolioEntry.update({ where: { id: entryId }, data: { isVisible: visible } });
  revalidatePath("/app/portafolio");
  revalidatePath("/");
  revalidatePath("/portafolio");
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
