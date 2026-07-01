import { getUsuarioActual } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { logoutAction } from "@/lib/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ModeloGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioActual();

  if (!usuario || usuario.role !== "MODEL") {
    redirect(APP_ROUTE.app.login.index);
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-zinc-950">
          Glamour<span className="text-gold-500">Models</span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="text-sm font-medium text-zinc-500 hover:text-gold-600">
            Cerrar sesión
          </button>
        </form>
      </header>
      <main className="p-6 lg:p-8">{children}</main>
    </div>
  );
}
