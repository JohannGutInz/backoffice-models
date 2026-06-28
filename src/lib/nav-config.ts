import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Globe,
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
      { label: "Calendario", href: APP_ROUTE.app.calendario.index, icon: CalendarDays },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Clientes", href: APP_ROUTE.app.clientes.index, icon: Building2 },
      { label: "Eventos", href: APP_ROUTE.app.eventos.index, icon: Sparkles },
      { label: "Bookings", href: APP_ROUTE.app.bookings.index, icon: ClipboardList },
      { label: "Paquetes", href: APP_ROUTE.app.paquetes.index, icon: PackageOpen },
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
