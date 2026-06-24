import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { RegistroForm } from "@/components/public/RegistroForm";
import { getConfiguracionSitio } from "@/lib/data";
import { toDateKey } from "@/lib/utils";

export default async function RegistroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = await getConfiguracionSitio();

  // El link es único y regenerable: si no coincide con el slug vigente, ya fue
  // invalidado (la agencia generó uno nuevo) — sin importar si antes funcionó.
  if (slug !== config.registroLinkSlug) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">Este enlace ya no es válido</h1>
        <p className="mt-2 text-sm text-zinc-500">
          El enlace de registro fue actualizado. Contáctanos para conseguir uno vigente.
        </p>
        <Link href="/contacto" className="mt-6 inline-block text-sm font-medium text-gold-700 hover:text-gold-600">
          Ir a contacto →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Únete a {config.nombreAgencia}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Completa tus datos. Nuestro equipo revisará tu información y te contactará por correo.
        </p>
      </div>
      <RegistroForm maxFecha={toDateKey(new Date())} />
    </div>
  );
}
