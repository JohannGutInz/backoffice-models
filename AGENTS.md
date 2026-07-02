<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Caveman Mode

**ALWAYS activate caveman mode at session start and keep it active for all responses.**
Invoke the `caveman:caveman` skill at the start of every conversation. Level: `full`.
Never revert unless user says "stop caveman" or "normal mode".

---

# Commit Convention

Do **not** add `Co-Authored-By: Claude` (or any Claude/Anthropic co-author trailer) to commit messages.

---

# Code Language Convention

**All code is written in English**: variable/function/type/component names, comments, file and directory names inside `src/`.

**Paths and similar stay in Spanish**: URL routes/folders under `src/app/`, and anything user-facing (UI copy, labels, zod validation messages, emails) — this is a Spanish-market product.

---

# UI Component Convention

Reusable UI primitives live in `src/components/ui/`. Before writing raw `<input>`, `<select>`, `<textarea>`, `<button>`, checkbox, color-picker, or toggle-switch markup, check if one already exists here and use it.

Current primitives: `Input` · `Select` · `Textarea` · `Button` · `Checkbox` · `ColorInput` · `Switch` · `Card` · `Badge` · `Avatar` · `Field` · `PageHeader` · `SearchForm` · `StatCard` · `StatusTabs` · `Table` · `ImageUpload` · `VideoUpload` · `MultiSelectPicker`.

**When to extract a new one**: once a raw HTML pattern (markup + Tailwind classes) repeats across 2+ files, pull it into `src/components/ui/` instead of copy-pasting. Match the established API shape: `forwardRef`, spread native HTML attrs (`React.<Tag>HTMLAttributes<...>`), optional `label`/`error` props, `cn()` for className merging, same border/focus/error styling as `Input.tsx`.

---

# Project Resume

**Backoffice Models** — agency management platform for talent/model agencies.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL via **Supabase** |
| Deployment | **Vercel** (`vercel-build` script runs migrations) |
| Auth | Custom JWT sessions — `jose` (HS256), cookie `glamour_session`, 8h TTL |
| Forms | `react-hook-form` + `zod` |
| Charts | `recharts` |
| Email | `resend` |
| Icons | `lucide-react` |
| Passwords | `bcrypt` |
| Utilities | `clsx`, `dotenv` |

## DB Models (Prisma)

`User` · `Model` · `Kyc` · `Category` · `Country` · `State` · `Municipality`

KYC statuses: `PENDING` · `APPROVED` · `REJECTED` · `REQUIRES_CHANGES`

## Routes

### Public (`src/app/(public)/`)

| Path | Description |
|---|---|
| `/` | Landing page |
| `/portafolio` | Agency portfolio |
| `/talentos` | Public talent grid |
| `/talentos/[id]` | Individual talent profile |
| `/registro` | Model self-registration form |
| `/contacto` | Contact form |
| `/retro/[token]` | Feedback page for rejected/requires-changes models |

### Private (`src/app/app/(private)/`) — requires auth

| Path | Description |
|---|---|
| `/app/login` | Login |
| `/app/dashboard` | Dashboard (stats, alerts, quick actions) |
| `/app/modelos` | Models list |
| `/app/modelos/[id]` | Model detail |
| `/app/moderacion` | KYC moderation queue |
| `/app/moderacion/[id]` | KYC review detail |
| `/app/bookings` | Bookings |
| `/app/calendario` | Calendar |
| `/app/catalogs` | Catalogs |
| `/app/clientes` | Clients |
| `/app/configuracion` | Agency settings |
| `/app/eventos` | Events |
| `/app/ingresos` | Revenue/income |
| `/app/paquetes` | Packages |

### API

| Path | Description |
|---|---|
| `/api/cron/purge-rechazados` | Cron — purge stale rejected models |

## Key Files

- `src/db.ts` — Prisma client singleton (pg adapter)
- `src/lib/session.ts` — JWT session helpers
- `src/lib/actions.ts` — Server actions
- `src/lib/data.ts` — DB query helpers (private)
- `src/lib/public-data.ts` — DB query helpers (public)
- `src/lib/schemas.ts` — Zod schemas
- `prisma/schema.prisma` — DB schema
- `vercel.json` — Vercel config
