import Link from "next/link";
import { Plus, Eye, EyeOff, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { listPortfolioEntries, getCurrentUser } from "@/lib/data";
import { togglePortfolioVisibilidadAction } from "@/lib/actions";
import { APP_ROUTE } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default async function PortafolioPage() {
  await getCurrentUser();
  const entries = await listPortfolioEntries();

  return (
    <div>
      <PageHeader
        title="Portafolio"
        subtitle="Eventos y campañas publicadas en el sitio."
        actions={
          <LinkButton href={APP_ROUTE.app.portafolio.nuevo}>
            <Plus className="h-4 w-4" /> Nueva entrada
          </LinkButton>
        }
      />

      <Card>
        <Table>
          <THead>
            <Th>Portada</Th>
            <Th>Marca</Th>
            <Th>Fecha</Th>
            <Th>Lugar</Th>
            <Th>Fotos</Th>
            <Th>Visible</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {entries.map((entry) => {
              const portada = entry.fotos.find((f) => f.isPortada) ?? entry.fotos[0];
              return (
                <Tr key={entry.id}>
                  <Td>
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-100">
                      {portada?.url ? (
                        <img src={portada.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                          sin foto
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`${APP_ROUTE.app.portafolio.index}/${entry.id}`}
                      className="font-medium text-zinc-900 hover:text-gold-600"
                    >
                      {entry.marca}
                    </Link>
                  </Td>
                  <Td className="text-zinc-500">{entry.fecha}</Td>
                  <Td className="text-zinc-500">{entry.lugar}</Td>
                  <Td className="text-zinc-500">{entry.fotos.filter((f) => f.url).length}</Td>
                  <Td>
                    <form
                      action={async () => {
                        "use server";
                        await togglePortfolioVisibilidadAction(entry.id, !entry.isVisible);
                      }}
                    >
                      <button
                        type="submit"
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                          entry.isVisible
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
                        )}
                      >
                        {entry.isVisible ? (
                          <><Eye className="h-3 w-3" /> Visible</>
                        ) : (
                          <><EyeOff className="h-3 w-3" /> Oculto</>
                        )}
                      </button>
                    </form>
                  </Td>
                  <Td>
                    <Link
                      href={`${APP_ROUTE.app.portafolio.index}/${entry.id}`}
                      className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
                    >
                      Editar <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Td>
                </Tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-400">
                  No hay entradas en el portafolio. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
