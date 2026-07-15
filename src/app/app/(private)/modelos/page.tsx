import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { ModelsGrid } from "@/components/models/ModelsGrid";
import { listModels } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function ModelsPage() {
  const models = await listModels();

  return (
    <div>
      <PageHeader
        title="Modelos"
        subtitle="Roster de talento de la agencia — alta interna y aprobados desde registro."
        actions={
          <LinkButton href={APP_ROUTE.app.models.index}>
            <Plus className="h-4 w-4" /> Nuevo modelo
          </LinkButton>
        }
      />
      <ModelsGrid models={models} />
    </div>
  );
}
