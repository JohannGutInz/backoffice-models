import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { ModelsGrid } from "@/components/models/ModelsGrid";
import { listModels } from "@/lib/data";
import { signAssetUrls } from "@/lib/storage";
import { APP_ROUTE } from "@/lib/routes";

export default async function ModelsPage() {
  const rawModels = await listModels();
  const models = await Promise.all(
    rawModels.map(async (m) => ({ ...m, assets: await signAssetUrls(m.assets) })),
  );

  return (
    <div>
      <PageHeader
        title="Modelos"
        subtitle="Roster de talento de la agencia — alta interna y aprobados desde registro."
        actions={
          <LinkButton href={APP_ROUTE.app.models.new}>
            <Plus className="h-4 w-4" /> Nuevo modelo
          </LinkButton>
        }
      />
      <ModelsGrid models={models} />
    </div>
  );
}
