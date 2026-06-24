import { AGENCY_ID, clientes, eventos, modelos } from "./mock-data";
import type { CategoriaModelo, Modelo } from "./types";

// Frontera pública. La landing SOLO puede importar de este archivo, nunca de
// mock-data.ts ni data.ts directamente — esto es lo que en una API real sería
// la capa de permisos: ningún campo privado (contacto, nombre legal, notas
// internas, tarifa, estado operativo) existe siquiera en los tipos de abajo.

export interface ModeloPublico {
  id: string;
  nombreArtistico: string;
  categoria: CategoriaModelo;
  etiquetas: string[];
  nivelExperiencia: Modelo["nivelExperiencia"];
  genero: Modelo["genero"];
  fisico?: Modelo["fisico"];
  fotoPrincipalUrl: string;
  bookUrls: string[];
  destacado: boolean;
}

function esVisiblePublicamente(m: Modelo): boolean {
  return m.agencyId === AGENCY_ID && m.estado === "activo" && m.publicoEnLanding;
}

function toPublico(m: Modelo): ModeloPublico {
  return {
    id: m.id,
    nombreArtistico: m.nombreArtistico,
    categoria: m.categoria,
    etiquetas: m.etiquetas,
    nivelExperiencia: m.nivelExperiencia,
    genero: m.genero,
    fisico: m.fisico,
    fotoPrincipalUrl: m.fotoPrincipalUrl,
    bookUrls: m.bookUrls,
    destacado: m.destacado,
  };
}

export async function listVitrinaModelos(): Promise<ModeloPublico[]> {
  return modelos
    .filter(esVisiblePublicamente)
    .sort((a, b) => Number(b.destacado) - Number(a.destacado))
    .map(toPublico);
}

export async function getVitrinaModelo(id: string): Promise<ModeloPublico | undefined> {
  const modelo = modelos.find((m) => m.id === id);
  if (!modelo || !esVisiblePublicamente(modelo)) return undefined;
  return toPublico(modelo);
}

export async function listDestacados(limit = 4): Promise<ModeloPublico[]> {
  const vitrina = await listVitrinaModelos();
  return vitrina.slice(0, limit);
}

export interface EventoPortafolio {
  id: string;
  nombre: string;
  tipo: string;
  lugar: string;
  fecha: string;
  clienteNombre: string;
}

export async function listEventosPortafolio(): Promise<EventoPortafolio[]> {
  return eventos
    .filter((e) => e.agencyId === AGENCY_ID && e.estado === "finalizado")
    .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    .map((e) => ({
      id: e.id,
      nombre: e.nombre,
      tipo: e.tipo,
      lugar: e.lugar,
      fecha: e.fechaInicio,
      clienteNombre: clientes.find((c) => c.id === e.clienteId)?.empresa ?? "Cliente de la agencia",
    }));
}
