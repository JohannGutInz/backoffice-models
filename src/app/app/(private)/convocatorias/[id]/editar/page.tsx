import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConvocatoriaForm } from "@/components/convocatorias/ConvocatoriaForm";
import { getConvocatoria } from "@/lib/data";

export default async function EditarConvocatoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getConvocatoria(id);
  if (!conv) notFound();

  const defaultValues = {
    titulo: conv.titulo,
    ciudad: conv.ciudad,
    tipo: conv.tipo,
    fechaEvento: conv.fechaEvento.toISOString().slice(0, 10),
    horario: conv.horario,
    lugar: conv.lugar,
    funciones: conv.funciones,
    pago: conv.pago,
    perfil: conv.perfil,
    cuerpo: conv.cuerpo,
    whatsappNumber: conv.whatsappNumber,
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Editar convocatoria" subtitle={conv.titulo} />
      <ConvocatoriaForm id={id} defaultValues={defaultValues} />
    </div>
  );
}
