import { TalentsGrid } from "@/components/public/TalentsGrid";
import { listPublicModels } from "@/lib/public-data";

export default async function TalentsPage() {
  const models = await listPublicModels();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-xl">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Talentos</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Explora el roster de modelos y talento representado por la agencia.
        </p>
      </div>
      <TalentsGrid models={models} />
    </div>
  );
}
