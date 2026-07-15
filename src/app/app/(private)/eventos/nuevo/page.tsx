import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { NuevoEventoForm } from "@/components/eventos/NuevoEventoForm";
import { getUsuarioActual } from "@/lib/data";

export default async function NuevoEventoPage() {
  await getUsuarioActual();

  return (
    <div>
      <PageHeader title="Nuevo evento" subtitle="Registra una convocatoria o trabajo para el equipo." />
      <Card className="max-w-2xl p-6">
        <NuevoEventoForm />
      </Card>
    </div>
  );
}
