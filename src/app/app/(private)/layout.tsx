import { AppShell } from "@/components/layout/AppShell";
import { getDashboardStats, getUsuarioActual } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { redirect } from "next/navigation";

// El backoffice muta datos en memoria vía server actions (lib/actions.ts) —
// nunca debe servirse una versión estática/cacheada al momento del build.
export const dynamic = "force-dynamic";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, stats] = await Promise.all([getUsuarioActual(), getDashboardStats()]);

  if (!usuario) {
    redirect(APP_ROUTE.app.login.index);
  }

  return (
    <AppShell usuario={usuario} pendingCount={stats.solicitudesPendientes}>
      {children}
    </AppShell>
  );
}
