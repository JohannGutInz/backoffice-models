"use client";

import { useEffect } from "react";
import { marcarConvocatoriasVistaAction } from "@/lib/actions";

export function MarcarVistas() {
  useEffect(() => {
    marcarConvocatoriasVistaAction();
  }, []);
  return null;
}
