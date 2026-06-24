import { Resend } from "resend";
import type { SolicitudRegistro } from "./types";

// Correo transaccional (CLAUDE-proyecto-real.md: "servicio tipo Resend / SendGrid").
// Sin RESEND_API_KEY configurada, cae a un log legible en consola — así los flujos
// de registro/moderación/contacto quedan completamente cableados sin depender de
// credenciales reales para esta etapa de demo.

const FROM = process.env.EMAIL_FROM ?? "GlamourModels <no-reply@glamourmodels.demo>";
const STAFF_INBOX = process.env.STAFF_EMAIL ?? "staff@glamourmodels.demo";
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function enviarCorreo({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(
      `\n[correo simulado] → ${to}\nAsunto: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`,
    );
    return { ok: true, simulado: true };
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { ok: true, simulado: false };
  } catch (error) {
    console.error("[correo] Error al enviar:", error);
    return { ok: false, simulado: false };
  }
}

function layout(titulo: string, cuerpoHtml: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#18181b">${titulo}</h2>
    ${cuerpoHtml}
    <p style="color:#a1a1aa;font-size:12px;margin-top:32px">GlamourModels</p>
  </div>`;
}

export async function emailSolicitudRecibida(sol: SolicitudRegistro) {
  return enviarCorreo({
    to: sol.correo,
    subject: "Recibimos tu registro — GlamourModels",
    html: layout(
      "¡Gracias por registrarte!",
      `<p>Hola ${sol.nombreCompleto}, recibimos tu solicitud y nuestro equipo la revisará pronto.</p>
       <p>Te avisaremos por este correo en cuanto tengamos una respuesta.</p>`,
    ),
  });
}

export async function emailNuevaSolicitudStaff(sol: SolicitudRegistro) {
  return enviarCorreo({
    to: STAFF_INBOX,
    subject: `Nueva solicitud de registro: ${sol.nombreCompleto}`,
    html: layout(
      "Nueva solicitud pendiente de moderación",
      `<p>${sol.nombreCompleto} (${sol.categoria}) envió una solicitud el ${sol.enviadoEn}.</p>
       <p><a href="${SITE_URL}/moderacion/${sol.id}">Revisar en el backoffice</a></p>`,
    ),
  });
}

export async function emailDecisionSolicitud(sol: SolicitudRegistro) {
  const retroLink = `${SITE_URL}/retro/${sol.tokenRevision}`;
  const copyPorEstado: Record<string, { subject: string; html: string }> = {
    requiere_cambios: {
      subject: "Necesitamos algunos ajustes en tu registro",
      html: `<p>Hola ${sol.nombreCompleto}, revisamos tu solicitud y tenemos algunos comentarios para ti.</p>
             <p><a href="${retroLink}">Ver comentarios y reenviar</a></p>`,
    },
    aprobado: {
      subject: "¡Bienvenido a GlamourModels!",
      html: `<p>Hola ${sol.nombreCompleto}, tu registro fue aprobado. Pronto el equipo de booking se pondrá en contacto contigo.</p>`,
    },
    rechazado: {
      subject: "Resultado de tu solicitud — GlamourModels",
      html: `<p>Hola ${sol.nombreCompleto}, gracias por tu interés. En este momento no encontramos un encaje con las categorías que manejamos.</p>`,
    },
  };
  const copy = copyPorEstado[sol.estado];
  if (!copy) return { ok: true, simulado: true };
  return enviarCorreo({ to: sol.correo, subject: copy.subject, html: layout(copy.subject, copy.html) });
}

export async function emailContactoCliente(data: { nombre: string; empresa: string; correo: string; mensaje: string }) {
  return enviarCorreo({
    to: STAFF_INBOX,
    subject: `Nuevo contacto de cliente: ${data.empresa || data.nombre}`,
    html: layout(
      "Nuevo mensaje desde el formulario de contacto",
      `<p><strong>${data.nombre}</strong> (${data.empresa || "sin empresa"}) — ${data.correo}</p>
       <p>${data.mensaje}</p>`,
    ),
  });
}
