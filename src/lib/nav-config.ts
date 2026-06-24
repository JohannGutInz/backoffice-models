import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Globe,
  LayoutGrid,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

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
    items: [{ label: "Inicio", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "Gestión de talento",
    items: [
      { label: "Modelos", href: "/modelos", icon: UsersRound },
      { label: "Moderación", href: "/moderacion", icon: ShieldCheck },
      { label: "Calendario", href: "/calendario", icon: CalendarDays },
    ],
  },
  {
    label: "Comercial",
    items: [
      { label: "Clientes", href: "/clientes", icon: Building2 },
      { label: "Eventos", href: "/eventos", icon: Sparkles },
      { label: "Bookings", href: "/bookings", icon: ClipboardList },
      { label: "Paquetes", href: "/paquetes", icon: PackageOpen },
    ],
  },
  {
    label: "Finanzas",
    items: [{ label: "Ingresos", href: "/ingresos", icon: CircleDollarSign }],
  },
  {
    label: "Configuración",
    items: [{ label: "Sitio público", href: "/configuracion", icon: Globe }],
  },
];
