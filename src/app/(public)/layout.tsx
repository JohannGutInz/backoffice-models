import { Montserrat } from "next/font/google";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getSiteSettings } from "@/lib/data";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// The site settings stay mutable in memory (see lib/actions.ts),
// so this section must never be static: every visit should reflect the
// current state defined from the backoffice.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteSettings();

  return (
    <div className={`${montserrat.className} flex min-h-screen flex-col bg-white`}>
      <PublicHeader publicRegistrationActive={config.publicRegistrationActive} />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter agencyName={config.agencyName} />
    </div>
  );
}
