import { listPortfolioPublico } from "@/lib/public-data";
import { PortfolioSection } from "@/components/public/PortfolioSection";

export default async function PortafolioPage() {
  const portafolio = await listPortfolioPublico();

  return (
    <div className="min-h-screen bg-white px-6 py-20">
      {portafolio.length === 0 ? (
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-zinc-600">Aún no hay trabajo publicado en el portafolio.</p>
        </div>
      ) : (
        <PortfolioSection entries={portafolio} />
      )}
    </div>
  );
}
