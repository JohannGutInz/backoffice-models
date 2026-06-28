"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";
import { AGENCY_ID, configuracionSitio, modelos, solicitudesRegistro } from "./mock-data";
import { SESSION_COOKIE, createSessionToken } from "./session";
import type { CategoriaModelo, EstadoSolicitud, Modelo } from "./types";
import { calcularEdad, toDateKey } from "./utils";
import { emailContactoCliente, emailDecisionSolicitud } from "./email";
import { APP_ROUTE } from "./routes";
import z from "zod";

// Mutaciones sobre los fixtures en memoria (mock-data.ts). Hacen las veces de la
// API central mientras no existe un backend real — por eso viven detrás de
// "use server" y nunca se llaman directo desde el cliente. El día que haya API,
// estas funciones son las únicas que cambian de cuerpo (siguen con la misma forma).

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// ---------- Sesión de staff (backoffice) ----------
const loginFormSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { success, data } = loginFormSchema.safeParse(Object.fromEntries(formData));

  if (!success) {
    return { status: "error", message: "Correo y contraseña son obligatorios." };
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

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

function siguienteNumeroModelo() {
  return `MOD-${String(modelos.length + 1).padStart(4, "0")}`;
}

// ---------- Auto-registro público ----------

const registroSchema = z.object({
  nombreCompleto: z.string().min(1, "El nombre completo es obligatorio."),
  correo: z.email("Correo electrónico inválido."),
  telefono: z.string().min(1, "El teléfono es obligatorio."),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((v) => calcularEdad(v) >= 18, "Solo aceptamos registros de personas mayores de 18 años."),
  genero: z.enum(["MALE", "FEMALE"], { error: "Género inválido." }),
  countryId: z.string().uuid("País inválido."),
  cityId: z.string().uuid("Ciudad inválida."),
  categoryIds: z.array(z.string().uuid()).min(1, "Selecciona al menos una categoría."),
  captchaA: z.coerce.number(),
  captchaB: z.coerce.number(),
  captchaRespuesta: z.coerce.number(),
});

export async function submitRegistroAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (String(formData.get("sitio_web") ?? "").trim() !== "") {
    return { status: "success", message: "¡Gracias! Revisaremos tu información y te contactaremos pronto." };
  }

  const result = registroSchema.safeParse({
    nombreCompleto: formData.get("nombreCompleto"),
    correo: formData.get("correo"),
    telefono: formData.get("telefono"),
    fechaNacimiento: formData.get("fechaNacimiento"),
    genero: formData.get("genero"),
    countryId: formData.get("countryId"),
    cityId: formData.get("cityId"),
    categoryIds: formData.getAll("categoryIds"),
    captchaA: formData.get("captchaA"),
    captchaB: formData.get("captchaB"),
    captchaRespuesta: formData.get("captchaRespuesta"),
  });

  if (!result.success) {
    return { status: "error", message: result.error.issues[0].message };
  }

  const { nombreCompleto, correo, telefono, fechaNacimiento, genero, countryId, cityId, categoryIds, captchaA, captchaB, captchaRespuesta } = result.data;

  if (captchaRespuesta !== captchaA + captchaB) {
    return { status: "error", message: "La respuesta de verificación no es correcta. Intenta de nuevo." };
  }

  const existing = await prisma.model.findUnique({ where: { email: correo } });
  if (existing) {
    return { status: "error", message: "Ya existe un registro con ese correo electrónico." };
  }

  await prisma.model.create({
    data: {
      fullName: nombreCompleto,
      email: correo,
      phone: telefono,
      birthDate: new Date(fechaNacimiento),
      genre: genero,
      countryId,
      cityId,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
  });

  return {
    status: "success",
    message: "¡Gracias! Recibimos tu información y nuestro equipo la revisará pronto. Te avisaremos por correo.",
  };
}

// Edición + reenvío desde el enlace temporal por token (vuelve a "pendiente").
export async function reenviarSolicitudAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const solicitud = solicitudesRegistro.find((s) => s.tokenRevision === token);
  if (!solicitud) return { status: "error", message: "Enlace inválido." };

  const nombreCompleto = String(formData.get("nombreCompleto") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nombreCompleto || !correo || !telefono) {
    return { status: "error", message: "Por favor completa todos los campos requeridos." };
  }

  solicitud.nombreCompleto = nombreCompleto;
  solicitud.correo = correo;
  solicitud.telefono = telefono;
  solicitud.estado = "pendiente";
  solicitud.actualizadoEn = toDateKey(new Date());

  revalidatePath("/moderacion");
  revalidatePath(`/retro/${token}`);

  return { status: "success", message: "¡Listo! Reenviamos tu información actualizada para una nueva revisión." };
}

// ---------- Moderación (backoffice) ----------

export async function moderarSolicitudAction(
  id: string,
  decision: "aprobado" | "rechazado" | "requiere_cambios",
  formData: FormData,
) {
  const solicitud = solicitudesRegistro.find((s) => s.id === id);
  if (!solicitud) return;

  const notaInterna = String(formData.get("notaInterna") ?? "");
  const retroParaModelo = String(formData.get("retroParaModelo") ?? "");
  const hoy = toDateKey(new Date());
  solicitud.estado = decision;
  solicitud.actualizadoEn = hoy;
  if (notaInterna.trim()) solicitud.notaInterna = notaInterna.trim();
  if (retroParaModelo.trim()) solicitud.retroParaModelo = retroParaModelo.trim();
  if (decision === "rechazado") solicitud.rechazadoEn = hoy;

  if (decision === "aprobado") {
    const nuevoModelo: Modelo = {
      id: `mdl_${Date.now()}`,
      agencyId: solicitud.agencyId,
      numeroModelo: siguienteNumeroModelo(),
      nombreArtistico: solicitud.nombreCompleto,
      nombreLegal: solicitud.nombreCompleto,
      fechaNacimiento: solicitud.fechaNacimiento,
      genero: solicitud.genero,
      nacionalidad: solicitud.nacionalidad,
      contacto: { correo: solicitud.correo, telefono: solicitud.telefono, ubicacion: solicitud.ubicacion },
      categoria: solicitud.categoria,
      etiquetas: [],
      nivelExperiencia: "nuevo",
      fotoPrincipalUrl: solicitud.fotoUrl,
      bookUrls: [],
      estado: "activo",
      destacado: false,
      // Spec: una solicitud aprobada "se convierte en modelo activo y entra a la vitrina".
      publicoEnLanding: true,
      disponibilidad: "disponible",
      tarifaBase: 0,
      creadoEn: hoy,
    };
    modelos.push(nuevoModelo);
    revalidatePath("/modelos");
    revalidatePath("/talentos");
  }

  await emailDecisionSolicitud(solicitud);

  revalidatePath("/moderacion");
  revalidatePath(`/moderacion/${id}`);
  revalidatePath("/dashboard");
}

// ---------- Catálogos (categorías) ----------

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = categorySchema.safeParse({ name: String(formData.get("name") ?? "").trim() });

  if (!result.success) {
    return { status: "error", message: result.error.issues[0].message };
  }

  const existing = await prisma.category.findFirst({ where: { name: { equals: result.data.name, mode: "insensitive" } } });
  if (existing) {
    return { status: "error", message: "Ya existe un catálogo con ese nombre." };
  }

  await prisma.category.create({ data: { name: result.data.name } });
  revalidatePath("/app/catalogs");

  return { status: "success", message: "Catálogo creado." };
}

export async function toggleCategoryEnabledAction(id: string, enabled: boolean): Promise<void> {
  await prisma.category.update({ where: { id }, data: { enabled } });
  revalidatePath("/app/catalogs");
}

// ---------- Configuración del sitio (backoffice) ----------

export async function guardarConfiguracionSitioAction(formData: FormData) {
  configuracionSitio.nombreAgencia = String(formData.get("nombreAgencia") ?? configuracionSitio.nombreAgencia);
  configuracionSitio.colorPrimario = String(formData.get("colorPrimario") ?? configuracionSitio.colorPrimario);
  configuracionSitio.heroTitulo = String(formData.get("heroTitulo") ?? configuracionSitio.heroTitulo);
  configuracionSitio.heroSubtitulo = String(formData.get("heroSubtitulo") ?? configuracionSitio.heroSubtitulo);

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

export async function submitContactoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (String(formData.get("sitio_web") ?? "").trim() !== "") {
    return { status: "success", message: "¡Gracias por tu mensaje! Te responderemos a la brevedad." };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const empresa = String(formData.get("empresa") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const mensaje = String(formData.get("mensaje") ?? "").trim();

  if (!nombre || !correo || !mensaje) {
    return { status: "error", message: "Por favor completa nombre, correo y mensaje." };
  }

  await emailContactoCliente({ nombre, empresa, correo, mensaje });

  return { status: "success", message: "¡Gracias por tu mensaje! Te responderemos a la brevedad." };
}
