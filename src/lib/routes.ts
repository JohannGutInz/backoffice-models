export const APP_ROUTE = {
  app: {
    login: {
      index: "/app/login"
    },
    dashboard: {
      index: "/app/dashboard"
    },
    settings: {
      index: "/app/configuracion"
    },
    moderation: {
      index: "/app/moderacion"
    },
    // Agency marketing photo gallery (EventoFoto) — feeds the public landing
    // carousel. Not booking/reservation management.
    events: {
      index: "/app/eventos"
    },
    models: {
      index: "/app/modelos",
      new: "/app/modelos/nuevo",
      edit: {
        id: (id: string) => `/app/modelos/${id}/editar`
      },
    },
    packages: {
      index: "/app/paquetes"
    },
    catalogs: {
      index: "/app/catalogs"
    },
    model: {
      profile: "/app/modelo/perfil"
    },
    convocatorias: {
      index: "/app/convocatorias",
      nueva: "/app/convocatorias/nueva",
      detail: (id: string) => `/app/convocatorias/${id}`,
      edit: (id: string) => `/app/convocatorias/${id}/editar`,
    },
  },
  registration: {
    index: "/registro"
  },
  contact: {
    index: "/contacto"
  },
  convocatorias: {
    index: "/convocatorias",
    detail: (id: string) => `/convocatorias/${id}`,
  },
};
