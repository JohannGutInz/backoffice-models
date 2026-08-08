import { PageHeader } from "@/components/ui/PageHeader";
import { EventoFotoUploadPanel } from "@/components/eventos-fotos/EventoFotoUploadPanel";
import { EventoFotoTable } from "@/components/eventos-fotos/EventoFotoTable";
import { listEventoFotos } from "@/lib/data";

export default async function EventosPage() {
  const fotos = await listEventoFotos();

  return (
    <div>
      <PageHeader
        title="Eventos"
        subtitle="Galería de fotos de eventos para el carrusel del sitio público."
      />

      <div className="space-y-6">
        <EventoFotoUploadPanel />
        <EventoFotoTable fotos={fotos} />
      </div>
    </div>
  );
}
