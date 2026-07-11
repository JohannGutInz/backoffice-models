import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Globe,
  Images,
  LayoutGrid,
  List,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { APP_ROUTE } from "@/lib/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: "Inicio", href: APP_ROUTE.app.dashboard.index, icon: LayoutGrid }],
  },
  {
    label: "Gestión de talento",
    items: [
      { label: "Modelos", href: APP_ROUTE.app.modelos.index, icon: UsersRound },
      { label: "Moderación", href: APP_ROUTE.app.moderacion.index, icon: ShieldCheck },
      { label: "Paquetes", href: APP_ROUTE.app.paquetes.index, icon: PackageOpen },
      { label: "Eventos", href: APP_ROUTE.app.eventos.index, icon: Sparkles },
      { label: "Calendario", href: APP_ROUTE.app.calendario.index, icon: CalendarDays },
      { label: "Portafolio", href: APP_ROUTE.app.portafolio.index, icon: Images },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Clientes", href: APP_ROUTE.app.clientes.index, icon: Building2 },
      { label: "Bookings", href: APP_ROUTE.app.bookings.index, icon: ClipboardList },
    ],
  },
  {
    label: "Finanzas",
    items: [{ label: "Ingresos", href: APP_ROUTE.app.ingresos.index, icon: CircleDollarSign }],
  },
  {
    label: "Configuración",
    items: [
      { label: "Sitio público", href: APP_ROUTE.app.configuracion.index, icon: Globe },
      { label: "Catálogos", href: APP_ROUTE.app.catalogs.index, icon: List },
    ],
  },
];
