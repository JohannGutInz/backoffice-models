import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PortfolioEntryForm } from "@/components/portafolio/PortfolioEntryForm";
import { getPortfolioEntry, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function EditarPortafolioPage({ params }: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await params;
  const entry = await getPortfolioEntry(id);
  if (!entry) notFound();

  const defaultValues = {
    marca: entry.marca,
    fecha: entry.fecha,
    lugar: entry.lugar,
    isVisible: entry.isVisible,
    fotos: entry.fotos.map((f) => ({ url: f.url, isPortada: f.isPortada, orden: f.orden })),
  };

  return (
    <div>
      <div className="mb-5">
        <Link
          href={APP_ROUTE.app.portafolio.index}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Portafolio
        </Link>
      </div>
      <PageHeader title={entry.marca} subtitle={`${entry.fecha} · ${entry.lugar}`} />
      <Card className="max-w-2xl p-6">
        <PortfolioEntryForm mode="edit" entryId={id} defaultValues={defaultValues} />
      </Card>
    </div>
  );
}
