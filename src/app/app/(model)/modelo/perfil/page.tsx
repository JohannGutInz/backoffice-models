import { PageHeader } from "@/components/ui/PageHeader";
import { PerfilModeloForm } from "@/components/modelo/PerfilModeloForm";
import { getModeloPropio, getUsuarioActual } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function PerfilModeloPage() {
  const usuario = await getUsuarioActual();
  const modelo = await getModeloPropio(usuario.id);

  if (!modelo) notFound();

  return (
    <div>
      <PageHeader title="Mi perfil" subtitle="Actualiza tus datos de contacto." />
      <div className="max-w-lg">
        <PerfilModeloForm modelo={modelo} />
      </div>
    </div>
  );
}
