import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PaquetesTable } from "@/components/paquetes/PaquetesTable";
import { listPackages } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function PackagesPage() {
  const packages = await listPackages();

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Propuestas de talento para clientes — agrupa modelos y comparte el link."
        actions={
          <LinkButton href={`${APP_ROUTE.app.packages.index}/nuevo`}>
            <Plus className="h-4 w-4" /> Nuevo paquete
          </LinkButton>
        }
      />

      <Card>
        <PaquetesTable packages={packages} />
      </Card>
    </div>
  );
}
