import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getSiteSettings } from "@/lib/data";

// The site settings stay mutable in memory (see lib/actions.ts),
// so this section must never be static: every visit should reflect the
// current state defined from the backoffice.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader
        agencyName={config.agencyName}
        publicRegistrationActive={config.publicRegistrationActive}
      />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter agencyName={config.agencyName} />
    </div>
  );
}
