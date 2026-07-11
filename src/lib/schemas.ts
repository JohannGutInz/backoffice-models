import { z } from "zod";
import { calcularEdad } from "./utils";

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const contactoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  empresa: z.string().optional(),
  correo: z.email("Correo electrónico inválido."),
  mensaje: z.string().min(1, "El mensaje es obligatorio."),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export const configuracionSchema = z.object({
  nombreAgencia: z.string().min(1, "El nombre de la agencia es obligatorio."),
  colorPrimario: z.string().min(1, "El color primario es obligatorio."),
  heroTitulo: z.string().min(1, "El título es obligatorio."),
  heroSubtitulo: z.string().min(1, "El subtítulo es obligatorio."),
});

export const reenviarSchema = z.object({
  nombreCompleto: z.string().min(1, "El nombre completo es obligatorio."),
  correo: z.email("Correo electrónico inválido."),
  telefono: z.string().min(1, "El teléfono es obligatorio."),
});

export const registroFormSchema = z.object({
  nombres: z.string().min(1, "Los nombres son obligatorios."),
  apellidoPaterno: z.string().min(1, "El apellido paterno es obligatorio."),
  apellidoMaterno: z.string().optional(),
  correo: z.email("Correo electrónico inválido."),
  telefono: z.string().min(1, "El teléfono es obligatorio."),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((v) => calcularEdad(v) >= 18, "Solo aceptamos registros de personas mayores de 18 años."),
  genero: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  countryId: z.string().min(1, "Selecciona un país."),
  stateId: z.string().min(1, "Selecciona un estado."),
  cityId: z.string().min(1, "Selecciona una ciudad."),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
  captchaRespuesta: z.number({ error: "Ingresa la respuesta de verificación." }),
  artisticName: z.string().optional(),
  nationality: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  hasVisibleTattoos: z.boolean(),
  shirtSize: z.string().optional(),
  pantsSize: z.string().optional(),
  availableToTravel: z.boolean(),
  hasPassport: z.boolean(),
  hasVisaUS: z.boolean(),
});

export const registroActionSchema = registroFormSchema.omit({
  stateId: true,
  captchaRespuesta: true,
});

export const nuevoModeloAdminFormSchema = z.object({
  firstName: z.string().min(1, "Requerido."),
  lastNameP: z.string().min(1, "Requerido."),
  lastNameM: z.string().optional(),
  artisticName: z.string().optional(),
  email: z.email("Correo inválido."),
  phone: z.string().min(1, "Requerido."),
  fechaNacimiento: z
    .string()
    .min(1, "Requerido.")
    .refine((v) => calcularEdad(v) >= 18, "Solo registramos talento mayor de 18 años."),
  genre: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  nationality: z.string().optional(),
  countryId: z.string().min(1, "Selecciona un país."),
  stateId: z.string().optional(),
  cityId: z.string().min(1, "Selecciona una ciudad."),
  height: z.string().optional(),
  weight: z.string().optional(),
  hasVisibleTattoos: z.boolean().optional(),
  shirtSize: z.string().optional(),
  pantsSize: z.string().optional(),
  availableToTravel: z.boolean(),
  hasPassport: z.boolean(),
  hasVisaUS: z.boolean(),
  categoryIds: z.array(z.string()),
});

export const nuevoModeloAdminActionSchema = nuevoModeloAdminFormSchema.omit({ stateId: true });

export const eventoFormSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio."),
    notas: z.string().optional(),
    isRecurring: z.boolean(),
    // One-time event fields
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    // Recurring fields
    recurringDays: z.array(z.number().int().min(0).max(6)),
    dailyStartTime: z.string().optional(),
    dailyEndTime: z.string().optional(),
    rangeStart: z.string().optional(),
    rangeEnd: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.isRecurring) {
      if (!d.recurringDays.length)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["recurringDays"], message: "Selecciona al menos un día." });
      if (!d.rangeStart)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rangeStart"], message: "Requerido." });
      if (!d.rangeEnd)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rangeEnd"], message: "Requerido." });
      if (!d.dailyStartTime)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dailyStartTime"], message: "Requerido." });
      if (!d.dailyEndTime)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dailyEndTime"], message: "Requerido." });
    } else {
      if (!d.startDate)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startDate"], message: "Requerido." });
      if (!d.startTime)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startTime"], message: "Requerido." });
      if (!d.endDate)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "Requerido." });
      if (!d.endTime)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endTime"], message: "Requerido." });
    }
  });

export type EventoFormData = z.infer<typeof eventoFormSchema>;

// Legacy alias used by existing action imports
export const crearEventoSchema = eventoFormSchema;
export type CrearEventoData = EventoFormData;

export const crearPaqueteSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
});

export type CrearPaqueteData = z.infer<typeof crearPaqueteSchema>;

export type NuevoModeloAdminFormData = z.infer<typeof nuevoModeloAdminFormSchema>;
export type NuevoModeloAdminActionData = z.infer<typeof nuevoModeloAdminActionSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type ContactoData = z.infer<typeof contactoSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type ConfiguracionData = z.infer<typeof configuracionSchema>;
export type ReenviarData = z.infer<typeof reenviarSchema>;
export type RegistroFormData = z.infer<typeof registroFormSchema>;
export type RegistroActionData = z.infer<typeof registroActionSchema>;
