import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogForm } from "@/components/catalogs/CatalogForm";
import { CatalogList } from "@/components/catalogs/CatalogList";
import { listCategories, listActivities } from "@/lib/data";
import { createCategoryAction, toggleCategoryEnabledAction, createActivityAction, toggleActivityEnabledAction } from "@/lib/actions";

export default async function CatalogsPage() {
  const [categories, activities] = await Promise.all([listCategories(), listActivities()]);

  return (
    <div>
      <PageHeader
        title="Catálogos"
        subtitle="Administra las categorías y actividades disponibles para los modelos."
      />

      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <CatalogForm
            title="Nueva categoría"
            subtitle="Agrega una categoría disponible para los modelos."
            action={createCategoryAction}
          />
          <CatalogList title="Categorías registradas" items={categories} onToggle={toggleCategoryEnabledAction} />
        </div>

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
    </div>
  );
}
