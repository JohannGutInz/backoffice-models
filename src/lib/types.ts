// Modelo de dominio v1 — backoffice de agencia de talentos.
// Toda entidad lleva agencyId para soportar multi-tenancy lógico desde el día uno,
// aunque hoy solo exista una agencia (ver CLAUDE-proyecto-real.md).

export type EstadoModelo = "activo" | "borrador" | "inactivo";

export type CategoriaModelo =
  | "moda"
  | "comercial"
  | "editorial"
  | "fitness"
  | "promocional"
  | "influencer";

export interface Modelo {
  id: string;
  agencyId: string;
  numeroModelo: string;
  nombreArtistico: string;
  nombreLegal: string;
  fechaNacimiento: string;
  genero: "femenino" | "masculino" | "no binario";
  nacionalidad: string;
  contacto: {
    correo: string;
    telefono: string;
    ubicacion: string;
    redes?: string;
  };
  fisico?: {
    estaturaCm?: number;
    medidas?: string;
    tallas?: string;
    colorCabello?: string;
    colorOjos?: string;
    tonoPiel?: string;
  };
  categoria: CategoriaModelo;
  etiquetas: string[];
  nivelExperiencia: "nuevo" | "intermedio" | "experimentado";
  fotoPrincipalUrl: string;
  bookUrls: string[];
  estado: EstadoModelo;
  destacado: boolean;
  // Curaduría explícita: un modelo puede estar "activo" para operar bookings
  // sin todavía estar listo/aprobado para mostrarse en la vitrina pública.
  publicoEnLanding: boolean;
  disponibilidad: "disponible" | "ocupado" | "no disponible";
  tarifaBase: number;
  notasInternas?: string;
  consentimiento?: {
    aceptado: boolean;
    fecha: string;
    versionDocumento: string;
    alcance: string;
  };
  creadoEn: string;
}

export type EstadoSolicitud =
  | "pendiente"
  | "requiere_cambios"
  | "aprobado"
  | "rechazado";

export interface SolicitudRegistro {
  id: string;
  agencyId: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  genero: Modelo["genero"];
  nacionalidad: string;
  ubicacion: string;
  categoria: CategoriaModelo;
  fotoUrl: string;
  estado: EstadoSolicitud;
  notaInterna?: string;
  retroParaModelo?: string;
  enviadoEn: string;
  actualizadoEn: string;
  tokenRevision: string;
  rechazadoEn?: string;
}

export interface Cliente {
  id: string;
  agencyId: string;
  empresa: string;
  contactoNombre: string;
  correo: string;
  telefono: string;
  industria: string;
  eventosTotales: number;
  ingresosTotales: number;
  creadoEn: string;
}

export type EstadoEvento = "planeado" | "confirmado" | "en_curso" | "finalizado" | "cancelado";

export interface Evento {
  id: string;
  agencyId: string;
  nombre: string;
  clienteId: string;
  tipo: string;
  lugar: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoEvento;
  bookingsIds: string[];
}

export type EstadoBooking = "pendiente" | "confirmado" | "completado" | "cancelado";

export interface Booking {
  id: string;
  agencyId: string;
  eventoId: string;
  modeloId: string;
  tarifa: number;
  estado: EstadoBooking;
  fecha: string;
  notas?: string;
}

export type EstadoPaquete = "borrador" | "enviado" | "aprobado" | "rechazado";

export interface Paquete {
  id: string;
  agencyId: string;
  nombre: string;
  clienteId: string;
  modeloIds: string[];
  estado: EstadoPaquete;
  total: number;
  creadoEn: string;
}

export interface Ingreso {
  id: string;
  agencyId: string;
  eventoId: string;
  clienteId: string;
  monto: number;
  metodo: "transferencia" | "tarjeta" | "efectivo";
  fecha: string;
}

export type RolStaff = "admin" | "booker" | "moderador" | "finanzas";

export interface UsuarioStaff {
  id: string;
  agencyId: string;
  nombre: string;
  correo: string;
  rol: RolStaff;
  avatarIniciales: string;
}

export interface ConfiguracionSitio {
  agencyId: string;
  nombreAgencia: string;
  logoUrl: string;
  colorPrimario: string;
  heroTitulo: string;
  heroSubtitulo: string;
  registroPublicoActivo: boolean;
  registroLinkSlug: string;
}
