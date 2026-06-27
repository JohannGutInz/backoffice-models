import { PageHeader } from "@/components/ui/PageHeader";
import { ConfiguracionForm } from "@/components/configuracion/ConfiguracionForm";
import { getConfiguracionSitio } from "@/lib/data";

export default async function ConfiguracionPage() {
  const config = await getConfiguracionSitio();

  return (
    <div>
      <PageHeader title="Configuración del sitio" subtitle="Controla lo que la landing pública muestra de tu agencia." />
      <div className="max-w-3xl">
        <ConfiguracionForm config={config} />
      </div>
    </div>
  );
}
