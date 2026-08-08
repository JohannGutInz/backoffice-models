"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import type { EventoFotoItem } from "@/lib/data";
import {
  actualizarEventoFotoAltAction,
  eliminarEventoFotoAction,
  reordenarEventoFotosAction,
  toggleEventoFotoPublishedAction,
} from "@/lib/actions";

const MAX_PUBLISHED = 12;

export function EventoFotoTable({ fotos }: { fotos: EventoFotoItem[] }) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Optimistic local order: clicking up/down updates this immediately instead
  // of waiting for the server round-trip, and further clicks operate on this
  // (already-reordered) list rather than the stale `fotos` prop — otherwise a
  // fast second click before revalidation lands would compute its swap from
  // outdated positions. Resyncing from the `fotos` prop happens during render
  // (React's documented "adjusting state when a prop changes" pattern, not an
  // effect — see https://react.dev/learn/you-might-not-need-an-effect), and is
  // skipped while a reorder is in flight so an unrelated revalidation (e.g. a
  // toggle on another row) can't stomp the optimistic order mid-swap.
  const [prevFotos, setPrevFotos] = useState(fotos);
  const [localFotos, setLocalFotos] = useState(fotos);
  const [reorderPending, startReorderTransition] = useTransition();

  if (fotos !== prevFotos && !reorderPending) {
    setPrevFotos(fotos);
    setLocalFotos(fotos);
  }

  const publishedCount = localFotos.filter((f) => f.published).length;

  function moveTo(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= localFotos.length) return;
    const reordered = [...localFotos];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setLocalFotos(reordered);
    const ids = reordered.map((f) => f.id);
    startReorderTransition(async () => {
      await reordenarEventoFotosAction(ids);
    });
  }

  function handleTogglePublished(foto: EventoFotoItem) {
    setError(null);
    startTransition(async () => {
      const result = await toggleEventoFotoPublishedAction(foto.id, !foto.published);
      if (result.status === "error") setError(result.message);
    });
  }

  function handleDelete(foto: EventoFotoItem) {
    if (!confirm("¿Eliminar esta foto? También se borra el archivo del almacenamiento. Esta acción no se puede deshacer.")) return;
    setError(null);
    startTransition(() => {
      eliminarEventoFotoAction(foto.id);
    });
  }

  return (
    <Card>
      <CardHeader
        title="Fotos"
        subtitle={`${localFotos.length} en total · ${publishedCount}/${MAX_PUBLISHED} publicadas`}
      />

      {error && <p className="px-5 pb-3 text-sm text-rose-600">{error}</p>}

      {localFotos.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-zinc-400">No hay fotos todavía. Agrega la primera arriba.</p>
      ) : (
        <Table>
          <THead>
            <Th>Foto</Th>
            <Th>Texto alternativo</Th>
            <Th>Orden</Th>
            <Th>Publicada</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {localFotos.map((foto, index) => (
              <EventoFotoRow
                key={foto.id}
                foto={foto}
                index={index}
                isFirst={index === 0}
                isLast={index === localFotos.length - 1}
                moveDisabled={reorderPending}
                onMoveUp={() => moveTo(index, -1)}
                onMoveDown={() => moveTo(index, 1)}
                onTogglePublished={() => handleTogglePublished(foto)}
                onDelete={() => handleDelete(foto)}
                onAltError={setError}
              />
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function EventoFotoRow({
  foto,
  index,
  isFirst,
  isLast,
  moveDisabled,
  onMoveUp,
  onMoveDown,
  onTogglePublished,
  onDelete,
  onAltError,
}: {
  foto: EventoFotoItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  moveDisabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  onAltError: (message: string | null) => void;
}) {
  const [altDraft, setAltDraft] = useState(foto.alt);
  const [pending, startTransition] = useTransition();
  const dirty = altDraft.trim() !== foto.alt && altDraft.trim().length > 0;

  function saveAlt() {
    const trimmed = altDraft.trim();
    if (!trimmed) {
      onAltError("El texto alternativo es obligatorio.");
      setAltDraft(foto.alt);
      return;
    }
    if (trimmed === foto.alt) return;
    onAltError(null);
    startTransition(async () => {
      const result = await actualizarEventoFotoAltAction(foto.id, trimmed);
      if (result.status === "error") onAltError(result.message);
    });
  }

  return (
    <Tr>
      <Td>
        <div className="relative h-14 w-11 overflow-hidden rounded-md bg-zinc-100">
          <Image src={foto.url} alt={foto.alt} fill className="object-cover" unoptimized />
        </div>
      </Td>
      <Td>
        <div className="flex max-w-40 items-center gap-2">
          <Input
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            onBlur={saveAlt}
            disabled={pending}
            aria-label={`Texto alternativo de la foto ${index + 1}`}
            className="py-1.5 text-xs"
          />
          {dirty && (
            <button
              type="button"
              onClick={saveAlt}
              disabled={pending}
              aria-label="Guardar texto alternativo"
              className="shrink-0 text-emerald-600 hover:text-emerald-700"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </Td>
      <Td>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst || moveDisabled}
            aria-label="Subir"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast || moveDisabled}
            aria-label="Bajar"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </Td>
      <Td>
        <Switch
          checked={foto.published}
          onChange={onTogglePublished}
          size="sm"
          aria-label={foto.published ? "Despublicar" : "Publicar"}
        />
      </Td>
      <Td>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Eliminar foto"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </Td>
    </Tr>
  );
}
