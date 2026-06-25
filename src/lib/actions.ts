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
import { emailContactoCliente, emailDecisionSolicitud, emailNuevaSolicitudStaff, emailSolicitudRecibida } from "./email";

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

export async function createUserAction(email: string, password: string): Promise<ActionState> {
  const cleanedEmail = email.trim().toLowerCase();
  const cleanedPassword = password.trim();

  if (!cleanedEmail || !cleanedPassword) {
    return { status: "error", message: "Email and password are required." };
  }

  try {
    const hashedPassword = await hashPassword(cleanedPassword);

    await prisma.user.create({
      data: {
        email: cleanedEmail,
        username: "dummy-user",
        hashedPassword: hashedPassword,
      },
    });

    return { status: "success", message: `Created user: ${cleanedEmail}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user.";
    return { status: "error", message };
  }
}

// ---------- Sesión de staff (backoffice) ----------

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!correo || !password) {
    return { status: "error", message: "Correo y contraseña son obligatorios." };
  }

  const usuario = await prisma.user.findUnique({
    where: { email: correo },
  });

  if (!usuario) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const passwordMatches = await bcrypt.compare(password, usuario.hashedPassword);
  if (!passwordMatches) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const sessionToken = await createSessionToken({
    sub: usuario.id,
    email: usuario.email,
    username: usuario.username,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  // Solo se acepta una ruta interna como destino post-login, nunca una URL externa
  // (evita que un ?next= manipulado redirija fuera del sitio).
  const next = String(formData.get("next") ?? "/dashboard");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

function randomToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function siguienteNumeroModelo() {
  return `MOD-${String(modelos.length + 1).padStart(4, "0")}`;
}

// ---------- Auto-registro público ----------

export async function submitRegistroAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Honeypot: los bots suelen rellenar todos los inputs, incluido este, oculto para humanos.
  if (String(formData.get("sitio_web") ?? "").trim() !== "") {
    return { status: "success", message: "¡Gracias! Revisaremos tu información y te contactaremos pronto." };
  }

  const captchaA = Number(formData.get("captchaA"));
  const captchaB = Number(formData.get("captchaB"));
  const respuesta = Number(formData.get("captchaRespuesta"));
  if (respuesta !== captchaA + captchaB) {
    return { status: "error", message: "La respuesta de verificación no es correcta. Intenta de nuevo." };
  }

  const nombreCompleto = String(formData.get("nombreCompleto") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const fechaNacimiento = String(formData.get("fechaNacimiento") ?? "");
  const genero = String(formData.get("genero") ?? "") as Modelo["genero"];
  const nacionalidad = String(formData.get("nacionalidad") ?? "").trim();
  const ubicacion = String(formData.get("ubicacion") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "") as CategoriaModelo;

  if (!nombreCompleto || !correo || !telefono || !fechaNacimiento || !genero || !nacionalidad || !ubicacion || !categoria) {
    return { status: "error", message: "Por favor completa todos los campos requeridos." };
  }

  if (calcularEdad(fechaNacimiento) < 18) {
    return { status: "error", message: "Solo aceptamos registros de personas mayores de 18 años." };
  }

  const hoy = toDateKey(new Date());
  const solicitud = {
    id: `sol_${Date.now()}`,
    agencyId: AGENCY_ID,
    nombreCompleto,
    correo,
    telefono,
    fechaNacimiento,
    genero,
    nacionalidad,
    ubicacion,
    categoria,
    fotoUrl: "",
    estado: "pendiente" as EstadoSolicitud,
    enviadoEn: hoy,
    actualizadoEn: hoy,
    tokenRevision: randomToken("tok"),
  };

  solicitudesRegistro.push(solicitud);
  await Promise.all([emailSolicitudRecibida(solicitud), emailNuevaSolicitudStaff(solicitud)]);

  revalidatePath("/moderacion");
  revalidatePath("/dashboard");

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
