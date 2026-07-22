import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogForm } from "@/components/catalogs/CatalogForm";
import { CatalogList } from "@/components/catalogs/CatalogList";
import { listActivities } from "@/lib/data";
import { createActivityAction, toggleActivityEnabledAction } from "@/lib/actions";

export default async function CatalogsPage() {
  const activities = await listActivities();

  return (
    <div>
      <PageHeader
        title="Catálogos"
        subtitle="Administra las actividades disponibles para los modelos."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogForm
          title="Nueva actividad"
          subtitle="Agrega una actividad disponible para los modelos."
          action={createActivityAction}
          placeholder="Ej. Pasarela, Comercial, Editorial…"
        />
        <CatalogList title="Actividades registradas" items={activities} onToggle={toggleActivityEnabledAction} />
      </div>
    </div>
  );
}
