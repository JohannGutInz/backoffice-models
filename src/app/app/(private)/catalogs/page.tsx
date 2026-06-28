import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogForm } from "@/components/catalogs/CatalogForm";
import { CatalogList } from "@/components/catalogs/CatalogList";
import { listCategories } from "@/lib/data";

export default async function CatalogsPage() {
  const categories = await listCategories();

  return (
    <div>
      <PageHeader
        title="Catálogos"
        subtitle="Administra las categorías disponibles para los modelos."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogForm />

        <CatalogList categories={categories} />
      </div>
    </div>
  );
}
