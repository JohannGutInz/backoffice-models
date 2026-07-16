import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoModeloForm } from "@/components/models/NuevoModeloForm";
import { getCurrentUser, listGeografia, listCategories } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function NuevoModeloPage() {
  await getCurrentUser();

  const [{ countries, states, municipalities }, categories] = await Promise.all([
    listGeografia(),
    listCategories(),
  ]);

  return (
    <div>
      <Link
        href={APP_ROUTE.app.models.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Modelos
      </Link>

      <PageHeader
        title="Nuevo modelo"
        subtitle="Alta manual de talento al roster. El KYC se aprueba automáticamente."
      />

      <div className="mt-8 max-w-2xl">
        <NuevoModeloForm
          countries={countries}
          states={states}
          municipalities={municipalities}
          categories={categories}
        />
      </div>
    </div>
  );
}
