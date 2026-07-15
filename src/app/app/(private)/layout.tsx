import { AppShell } from "@/components/layout/AppShell";
import { getDashboardStats, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { redirect } from "next/navigation";

// The backoffice mutates data in memory via server actions (lib/actions.ts) —
// a static/cached version must never be served at build time.
export const dynamic = "force-dynamic";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, stats] = await Promise.all([getCurrentUser(), getDashboardStats()]);

  if (!user || user.role !== "ADMIN") {
    redirect(APP_ROUTE.app.login.index);
  }

  return (
    <AppShell user={user} pendingCount={stats.pendingApplications}>
      {children}
    </AppShell>
  );
}
