import { z } from "zod";
import { calculateAge } from "./utils";

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  company: z.string().optional(),
  email: z.email("Correo electrónico inválido."),
  message: z.string().min(1, "El mensaje es obligatorio."),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export const settingsSchema = z.object({
  agencyName: z.string().min(1, "El nombre de la agencia es obligatorio."),
  primaryColor: z.string().min(1, "El color primario es obligatorio."),
  heroTitle: z.string().min(1, "El título es obligatorio."),
  heroSubtitle: z.string().min(1, "El subtítulo es obligatorio."),
});

export const resendApplicationSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio."),
  email: z.email("Correo electrónico inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
});

export const registrationFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  email: z.email("Correo electrónico inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((v) => calculateAge(v) >= 18, "Solo aceptamos registros de personas mayores de 18 años."),
  gender: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  countryId: z.string().min(1, "Selecciona un país."),
  nationalityId: z.string().min(1, "Selecciona una nacionalidad."),
  stateId: z.string().min(1, "Selecciona un estado."),
  cityId: z.string().min(1, "Selecciona una ciudad."),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  captchaAnswer: z.number({ error: "Ingresa la respuesta de verificación." }),
});

export const registrationActionSchema = registrationFormSchema.omit({
  stateId: true,
  captchaAnswer: true,
});

export const modelAttributesSchema = z.object({
  height: z.number({ error: "La estatura es obligatoria." }).int().positive(),
  currentWeight: z.number({ error: "El peso es obligatorio." }).int().positive(),
  hasVisibleTattoos: z.boolean(),
  shirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL"], { error: "Selecciona una talla de camisa." }),
  pantsSizeScale: z.enum(["MEN", "WOMEN"], { error: "Selecciona una escala de talla de pantalón." }),
  pantsSize: z.string().min(1, "La talla de pantalón es obligatoria."),
  travelAvailability: z.boolean(),
  hasPassport: z.boolean(),
  hasVisa: z.boolean(),
  activityIds: z.array(z.string()).min(1, "Selecciona al menos una actividad."),
});

export const ownModelProfileSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  mainPhotoUrl: z.string().optional(),
  photoUrls: z.array(z.string()).max(5, "Máximo 5 fotos en el book."),
  videoUrls: z.array(z.string()).max(3, "Máximo 3 videos."),
}).merge(modelAttributesSchema);

export const modelEditSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
}).merge(modelAttributesSchema);

export type LoginData = z.infer<typeof loginSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
export type ResendApplicationData = z.infer<typeof resendApplicationSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
export type RegistrationActionData = z.infer<typeof registrationActionSchema>;
export type ModelAttributesData = z.infer<typeof modelAttributesSchema>;
export type OwnModelProfileData = z.infer<typeof ownModelProfileSchema>;
export type ModelEditData = z.infer<typeof modelEditSchema>;

export const eventoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre del evento es obligatorio."),
  notas: z.string(),
  isRecurring: z.boolean(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  recurringDays: z.array(z.number()),
  dailyStartTime: z.string(),
  dailyEndTime: z.string(),
  rangeStart: z.string(),
  rangeEnd: z.string(),
});

export type EventoFormData = z.infer<typeof eventoFormSchema>;

export const crearPaqueteSchema = z.object({
  name: z.string().min(1, "El nombre del paquete es obligatorio."),
  description: z.string().optional(),
});

export type CrearPaqueteData = z.infer<typeof crearPaqueteSchema>;

export const portfolioEntrySchema = z.object({
  marca: z.string().min(1, "La marca es obligatoria."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  lugar: z.string().min(1, "El lugar es obligatorio."),
  isVisible: z.boolean(),
  fotos: z.array(z.object({
    url: z.string(),
    isPortada: z.boolean(),
    orden: z.number().int(),
  })),
});

export type PortfolioEntryData = z.infer<typeof portfolioEntrySchema>;

export const nuevoModeloAdminFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  lastNameP: z.string().min(1, "El apellido paterno es obligatorio."),
  lastNameM: z.string().optional(),
  artisticName: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email("Correo inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  genre: z.enum(["MALE", "FEMALE"]),
  countryId: z.string().min(1),
  stateId: z.string().optional(),
  cityId: z.string().min(1),
  nationalityId: z.string().min(1),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
  availableToTravel: z.boolean(),
  hasPassport: z.boolean(),
  hasVisaUS: z.boolean(),
  hasVisibleTattoos: z.boolean(),
  height: z.string().optional(),
  weight: z.string().optional(),
  shirtSize: z.string().optional(),
  pantsSize: z.string().optional(),
});

export type NuevoModeloAdminFormData = z.infer<typeof nuevoModeloAdminFormSchema>;

export const convocatoriaSchema = z.object({
  titulo: z.string().min(1, "El título es obligatorio."),
  ciudad: z.string().min(1, "La ciudad es obligatoria."),
  tipo: z.string().min(1, "El tipo es obligatorio."),
  fechaEvento: z.string().min(1, "La fecha del evento es obligatoria."),
  horario: z.string().min(1, "El horario es obligatorio."),
  lugar: z.string().min(1, "El lugar es obligatorio."),
  funciones: z.string().min(1, "Las funciones son obligatorias."),
  pago: z.string().min(1, "El pago es obligatorio."),
  perfil: z.string().min(1, "El perfil requerido es obligatorio."),
  cuerpo: z.string(),
  whatsappNumber: z.string().min(1, "El número de WhatsApp es obligatorio."),
});

export type ConvocatoriaFormData = z.infer<typeof convocatoriaSchema>;
