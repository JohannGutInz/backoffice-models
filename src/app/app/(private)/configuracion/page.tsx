import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getSiteSettings } from "@/lib/data";

export default async function SettingsPage() {
  const config = await getSiteSettings();

  return (
    <div>
      <PageHeader title="Configuración del sitio" subtitle="Controla lo que la landing pública muestra de tu agencia." />
      <div className="max-w-3xl">
        <SettingsForm config={config} />
      </div>
    </div>
  );
}
