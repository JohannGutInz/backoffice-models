import { RegistroForm } from "@/components/public/RegistroForm";
import { getConfiguracionSitio } from "@/lib/data";
import { toDateKey } from "@/lib/utils";
import { prisma } from "@/db";

export default async function RegistroPage() {
  const [config, countries, states, municipalities, categories] = await Promise.all([
    getConfiguracionSitio(),
    prisma.country.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.state.findMany({ select: { id: true, name: true, countryId: true }, orderBy: { name: "asc" } }),
    prisma.municipality.findMany({ select: { id: true, name: true, stateId: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({
      where: { enabled: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Únete a {config.nombreAgencia}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Completa tus datos. Nuestro equipo revisará tu información y te contactará por correo.
        </p>
      </div>
      <RegistroForm
        maxFecha={toDateKey(new Date())}
        countries={countries}
        states={states}
        municipalities={municipalities}
        categories={categories}
      />
    </div>
  );
}
