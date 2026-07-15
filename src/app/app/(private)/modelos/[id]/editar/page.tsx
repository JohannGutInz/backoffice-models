import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getModel, listCategories, listActivities } from "@/lib/data";
import { ModelEditForm } from "@/components/models/ModelEditForm";
import { APP_ROUTE } from "@/lib/routes";
import { formatFullName } from "@/lib/utils";

export default async function ModelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [model, categories, activities] = await Promise.all([
    getModel(id),
    listCategories(),
    listActivities(),
  ]);

  if (!model) notFound();

  return (
    <div>
      <Link
        href={`${APP_ROUTE.app.models.index}/${model.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a {formatFullName(model)}
      </Link>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">Editar modelo</h1>

      <div className="max-w-2xl">
        <ModelEditForm model={model} categories={categories} activities={activities} />
      </div>
    </div>
  );
}
