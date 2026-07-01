import { PageHeader } from "@/components/ui/PageHeader";
import { ModelProfileForm } from "@/components/models/ModelProfileForm";
import { getOwnModel, getCurrentUser } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function ModelProfilePage() {
  const user = await getCurrentUser();
  const model = await getOwnModel(user.id);

  if (!model) notFound();

  return (
    <div>
      <PageHeader title="Mi perfil" subtitle="Actualiza tus datos de contacto." />
      <div className="max-w-lg">
        <ModelProfileForm model={model} />
      </div>
    </div>
  );
}
