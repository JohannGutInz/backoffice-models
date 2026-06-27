import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { ModelosGrid } from "@/components/modelos/ModelosGrid";
import { listModelos } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function ModelosPage() {
  const modelos = await listModelos();

  return (
    <div>
      <PageHeader
        title="Modelos"
        subtitle="Roster de talento de la agencia — alta interna y aprobados desde registro."
        actions={
          <LinkButton href={APP_ROUTE.app.modelos.index}>
            <Plus className="h-4 w-4" /> Nuevo modelo
          </LinkButton>
        }
      />
      <ModelosGrid modelos={modelos} />
    </div>
  );
}
