import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ModelProfileForm } from "@/components/models/ModelProfileForm";
import { getOwnModel, getCurrentUser, listActivities } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function ModelProfilePage() {
  const user = await getCurrentUser();
  const [model, activities] = await Promise.all([getOwnModel(user.id), listActivities()]);

  if (!model) notFound();

  return (
    <div>
      <PageHeader
        title="Mi perfil"
        subtitle="Completa tus datos para que tu perfil entre a revisión."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Estado de tu KYC:</span>
            <StatusBadge status={model.kyc.status} />
          </div>
        }
      />
      <div className="max-w-2xl">
        <ModelProfileForm model={model} activities={activities} />
      </div>
    </div>
  );
}
