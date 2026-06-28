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
  nombreCompleto: z.string().min(1, "El nombre completo es obligatorio."),
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
});

export const registroActionSchema = registroFormSchema.omit({
  stateId: true,
  captchaRespuesta: true,
});

export type LoginData = z.infer<typeof loginSchema>;
export type ContactoData = z.infer<typeof contactoSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type ConfiguracionData = z.infer<typeof configuracionSchema>;
export type ReenviarData = z.infer<typeof reenviarSchema>;
export type RegistroFormData = z.infer<typeof registroFormSchema>;
export type RegistroActionData = z.infer<typeof registroActionSchema>;
