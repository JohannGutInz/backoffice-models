import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoPaqueteForm } from "@/components/paquetes/NuevoPaqueteForm";
import { getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function NuevoPaquetePage() {
  await getCurrentUser();

  return (
    <div>
      <Link
        href={APP_ROUTE.app.packages.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Paquetes
      </Link>

      <PageHeader
        title="Nuevo paquete"
        subtitle="Crea la propuesta y luego agrega los modelos desde el detalle."
      />

      <div className="mt-8 max-w-xl">
        <NuevoPaqueteForm />
      </div>
    </div>
  );
}
