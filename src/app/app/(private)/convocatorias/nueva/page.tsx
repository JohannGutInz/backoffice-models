import { PageHeader } from "@/components/ui/PageHeader";
import { ConvocatoriaForm } from "@/components/convocatorias/ConvocatoriaForm";

export default function NuevaConvocatoriaPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nueva convocatoria"
        subtitle="Se guardará como borrador. Usa el botón Publicar cuando esté lista."
      />
      <ConvocatoriaForm />
    </div>
  );
}
