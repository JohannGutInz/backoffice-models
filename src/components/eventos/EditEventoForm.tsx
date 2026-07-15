"use client";

import { EventoForm } from "./EventoForm";
import type { EventoFormData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";

interface Props {
  eventoId: string;
  defaultValues: Partial<EventoFormData>;
}

export function EditEventoForm({ eventoId, defaultValues }: Props) {
  return (
    <EventoForm
      mode="edit"
      eventoId={eventoId}
      defaultValues={defaultValues}
      redirectOnSuccess={`${APP_ROUTE.app.eventos.index}/${eventoId}`}
    />
  );
}
