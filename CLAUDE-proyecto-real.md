# CLAUDE.md — Plataforma a la medida para agencia de talentos y modelos (v1)

## Qué estamos construyendo

Una plataforma a la medida para una agencia de modelos y talentos, con **dos frentes sobre un mismo backend**:

1. **Landing pública** — vitrina filtrable de talento, fichas individuales, sección de eventos/portafolio, auto-registro de aspirantes y contacto para clientes.
2. **Backoffice (ERP)** — panel interno donde el staff gestiona modelos, eventos, clientes, paquetes, modera registros y controla ingresos.

Ambos frentes consumen una **API central** que es la única que toca la base de datos. Este es el producto real, no un prototipo: prioriza corrección, seguridad y mantenibilidad.

## Principios de arquitectura (no negociables)

- **API central única.** Solo el backend accede a la base de datos. Landing y backoffice son clientes de la API.
- **Multi-tenancy lógico desde el día uno.** Incluir `agency_id` en el modelo de datos aunque hoy exista una sola agencia. Esto permite convertir el sistema en SaaS más adelante sin rediseñar. No construir la lógica multi-cliente completa todavía, solo dejar la estructura lista.
- **Separación estricta público / privado.** La landing solo consume endpoints de **lectura** y solo de perfiles en estado `activo` marcados como públicos. Nunca expone datos privados: contacto del modelo, nombre legal, notas internas, finanzas. Esta separación se aplica a nivel de **permisos de la API**, no solo de interfaz.
- **Curaduría humana obligatoria.** Nada se publica automáticamente. Todo perfil o cambio pasa por aprobación del staff.
- **Object storage para material pesado.** Todas las fotos, books y videos van a object storage (S3 / R2 / GCS) con **URLs firmadas y de expiración**. En la base de datos solo se guarda la referencia, nunca el binario. Buckets nunca públicos.
- **Solo talento mayor de edad.** Validar mayoría de edad en el registro. No existen flujos para menores.

## Stack

- **Backend / API:** Node + TypeScript (NestJS) o Python (Django/FastAPI) — a elección del equipo. REST o GraphQL.
- **Base de datos:** PostgreSQL.
- **Object storage:** S3, Cloudflare R2 o Google Cloud Storage, con URLs firmadas.
- **Frontend landing:** Next.js (App Router) + React + TypeScript + Tailwind. SSR/SSG por SEO.
- **Frontend backoffice:** React + TypeScript + Tailwind, detrás de login.
- **Correo transaccional:** servicio tipo Resend / SendGrid (para retro a modelos y notificaciones).

## Despliegue

- Landing en dominio principal (`www.agencia.com`), backoffice en subdominio (`admin.agencia.com`), no indexado.
- Base de datos como servicio gestionado con respaldos automáticos.
- Variables de entorno para credenciales; nunca en el código.

## Modelo de datos (entidades núcleo)

Todas las entidades llevan `agency_id`. Relaciones principales:

- `CLIENTE` solicita `EVENTO` y recibe `PAQUETE`.
- `EVENTO` contiene varios `BOOKING`; cada `BOOKING` vincula un `MODELO` con un `EVENTO` (con tarifa y estado propios).
- `PAQUETE` agrupa varios `MODELO` (relación muchos-a-muchos) para enviar propuestas al cliente.
- `EVENTO` genera `INGRESO`.
- `SOLICITUD_REGISTRO` se convierte en `MODELO` solo al ser aprobada por el staff.
- `USUARIO_STAFF` con roles.

### Atributos de MODELO (por bloques)
- Identidad: nombre artístico (público), nombre legal (privado), fecha de nacimiento (validar mayoría de edad), género, nacionalidad, número de modelo.
- Contacto (privado, nunca público): correo, teléfono, ubicación, redes.
- Características físicas (alimentan filtros, opcionales según categoría): estatura, medidas, tallas, color de cabello/ojos, tono de piel.
- Categorización: categoría/tipo de talento, etiquetas/habilidades, nivel de experiencia.
- Material visual: foto principal, book (galería ordenable), composite, video/reel.
- Operativo (solo backoffice): estado, destacado, disponibilidad, tarifa, notas internas.
- Legal: aceptación de uso de imagen (fecha + versión del documento), alcance del consentimiento.

## Módulos a construir en la v1 (núcleo)

- **Dashboard** — indicadores y pendientes.
- **Calendario / Agenda** — bookings y disponibilidad.
- **Modelos** — alta manual (incluye perfiles incompletos en borrador) + perfiles aprobados desde registro.
- **Clientes / CRM** — empresas, contactos, historial.
- **Eventos** — servicios y trabajos.
- **Bookings** — contratación de un modelo para un evento (tarifa, estado).
- **Paquetes** — agrupar modelos y enviar propuestas al cliente.
- **Moderación de registros** — bandeja de solicitudes (ver flujo abajo).
- **Control de ingresos** — registro básico de ingresos por evento.
- **Configuración del sitio** — logo, paleta, textos del hero, interruptor de visibilidad del link de registro. La landing consume estos ajustes.

> Fuera de la v1 (fase 2, no construir ahora): finanzas completas (pagos a modelos, comisiones), facturación, reportes avanzados, gestión documental/contratos, portal del modelo con login, integraciones (Instagram, WhatsApp), administración avanzada de roles.

## Flujo de registro y moderación

**Dos vías de alta, una sola tabla de modelos:**

1. **Vía interna (principal):** el staff crea perfiles directamente desde el backoffice, incluso incompletos (estado borrador). Para modelos que ya trabajaron con la agencia.
2. **Vía auto-registro:** un **link único** con interruptor de visibilidad. La agencia lo enciende para captación pública en la landing, o lo apaga y lo comparte en privado. El link debe ser **regenerable** (invalidar el anterior) y el formulario público debe tener **control anti-bots básico**. El auto-registro genera una `SOLICITUD_REGISTRO`, **nunca una cuenta con login**.

**Estados de la solicitud:** `pendiente` → `requiere cambios` → (vuelve a `pendiente` al reenviar) → `aprobado` (se convierte en modelo activo y entra a la vitrina) o `rechazado`.

- La retroalimentación al modelo viaja por un **enlace temporal por token** (no cuenta permanente), donde ve los comentarios y puede editar y reenviar.
- Dos campos de comentarios separados: **nota interna** (solo staff) y **retro para el modelo**. No mezclarlos.

**Rechazo y retención:**
- Al rechazar: **borrado suave (soft delete)** con un clic — desaparece de las vistas activas del staff de inmediato.
- **Purga automática a los 45 días:** un job programado elimina definitivamente el registro **y sus imágenes en el object storage**. Asegurar que la purga borre los archivos del storage, no solo la fila de la base de datos.

## Seguridad y datos personales

- HTTPS en todo; cifrado en reposo para datos sensibles e imágenes.
- Control de acceso por roles en el backoffice.
- URLs firmadas con expiración para todo el material.
- Política de retención explícita (los rechazados se purgan a los 45 días).
- No exponer datos de contacto directos de modelos en ninguna vista pública.

## Criterios de aceptación v1

- Landing pública responsiva con vitrina filtrable (filtros en cliente o servidor), fichas individuales sin datos privados, sección de eventos y formularios de registro y contacto.
- Backoffice con login y los módulos núcleo operativos.
- Las dos vías de alta de modelos funcionando, ambas hacia la misma tabla.
- Flujo de moderación completo con los cuatro estados, retro por token, soft delete y purga a 45 días (incluyendo borrado en storage).
- Separación de permisos verificable: la landing no puede obtener campos privados ni perfiles no públicos, ni siquiera manipulando la petición.
- Configuración del sitio editable desde el backoffice y reflejada en la landing.

## Flujo de trabajo sugerido

1. Definir esquema de base de datos y migraciones (con `agency_id`).
2. Construir la API y su capa de permisos antes que los frontends.
3. Backoffice: módulo Modelos + Moderación primero (es el corazón).
4. Landing: vitrina + fichas + registro.
5. Configuración del sitio y correo transaccional.
6. Job de purga programada.
7. Pruebas de la separación de permisos público/privado como punto crítico.
