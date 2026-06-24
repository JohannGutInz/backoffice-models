import { AppShell } from "@/components/layout/AppShell";
import { getDashboardStats, getUsuarioActual } from "@/lib/data";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, stats] = await Promise.all([getUsuarioActual(), getDashboardStats()]);

  return (
    <AppShell usuario={usuario} pendingCount={stats.solicitudesPendientes}>
      {children}
    </AppShell>
  );
}
