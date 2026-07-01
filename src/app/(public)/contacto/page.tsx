import { ContactForm } from "@/components/public/ContactForm";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo } = await searchParams;
  const defaultMessage = modelo ? `Hola, me interesa saber más sobre ${modelo} para un proyecto.` : undefined;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Contacto</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Cuéntanos sobre tu proyecto o el talento que buscas — el equipo de booking te responde directamente.
        </p>
      </div>
      <ContactForm defaultMessage={defaultMessage} />
    </div>
  );
}
