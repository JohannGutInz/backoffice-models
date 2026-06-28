import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getConfiguracionSitio } from "@/lib/data";

// La configuración del sitio se mantiene mutable en memoria (ver lib/actions.ts),
// así que esta sección nunca debe quedar estática: cada visita debe reflejar el
// estado actual definido desde el backoffice.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfiguracionSitio();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader
        nombreAgencia={config.nombreAgencia}
        registroPublicoActivo={config.registroPublicoActivo}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter nombreAgencia={config.nombreAgencia} />
    </div>
  );
}
