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
    bookings: {
      index: "/app/bookings"
    },
    clients: {
      index: "/app/clientes"
    },
    events: {
      index: "/app/eventos"
    },
    models: {
      index: "/app/modelos",
      edit: {
        id: (id: string) => `/app/modelos/${id}/editar`
      },
    },
    calendar: {
      index: "/app/calendario"
    },
    packages: {
      index: "/app/paquetes"
    },
    income: {
      index: "/app/ingresos"
    },
    catalogs: {
      index: "/app/catalogs"
    },
    portafolio: {
      index: "/app/portafolio",
      nuevo: "/app/portafolio/nuevo",
    },
    model: {
      profile: "/app/modelo/perfil"
    }
  },
  registration: {
    index: "/registro"
  },
  contact: {
    index: "/contacto"
  }
};
