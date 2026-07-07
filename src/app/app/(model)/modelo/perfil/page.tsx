import { AlertTriangle, XCircle } from "lucide-react";
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

      {model.kyc.status === "REQUIRES_CHANGES" && model.kyc.comment && (
        <div className="mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <p className="font-medium">La agencia solicitó cambios en tu perfil</p>
            <p className="mt-1">{model.kyc.comment}</p>
          </div>
        </div>
      )}

      {model.kyc.status === "REJECTED" && model.kyc.comment && (
        <div className="mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Tu perfil fue rechazado</p>
            <p className="mt-1">{model.kyc.comment}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <ModelProfileForm model={model} activities={activities} />
      </div>
    </div>
  );
}
