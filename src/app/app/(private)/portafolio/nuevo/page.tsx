import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PortfolioEntryForm } from "@/components/portafolio/PortfolioEntryForm";
import { getUsuarioActual } from "@/lib/data";

export default async function NuevoPortafolioPage() {
  await getUsuarioActual();
  return (
    <div>
      <PageHeader title="Nueva entrada" subtitle="Agrega una campaña o evento al portafolio público." />
      <Card className="max-w-2xl p-6">
        <PortfolioEntryForm mode="create" />
      </Card>
    </div>
  );
}
