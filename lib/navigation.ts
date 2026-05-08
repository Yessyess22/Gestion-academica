import {
  LayoutDashboard,
  Syringe,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
  UserCircle,
  Baby,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navigationConfig: Record<string, NavGroup[]> = {
  vacunador: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", url: "/vacunador", icon: LayoutDashboard },
        { title: "Registrar Vacuna", url: "/vacunador/vacunar", icon: Syringe },
        { title: "Mis Pacientes", url: "/vacunador/pacientes", icon: Baby },
        { title: "Mis Registros", url: "/vacunador/registros", icon: ClipboardList },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { title: "Mi Perfil", url: "/vacunador/perfil", icon: UserCircle },
      ],
    },
  ],
  coordinador: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", url: "/coordinador", icon: LayoutDashboard },
        { title: "Registros", url: "/coordinador/registros", icon: ClipboardList },
        { title: "Cobertura", url: "/coordinador/cobertura", icon: BarChart3 },
      ],
    },
    {
      label: "Cuenta",
      items: [
        { title: "Mi Perfil", url: "/coordinador/perfil", icon: UserCircle },
      ],
    },
  ],
  admin: [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
        { title: "Usuarios", url: "/admin/usuarios", icon: Users },
        { title: "Establecimientos", url: "/admin/establecimientos", icon: Building2 },
        { title: "Vacunas PAI", url: "/admin/vacunas", icon: Syringe },
        { title: "Lotes", url: "/admin/lotes", icon: ClipboardList },
        { title: "Pacientes", url: "/admin/pacientes", icon: Baby },
        { title: "Registros", url: "/admin/registros", icon: ClipboardList },
        { title: "Reportes", url: "/admin/reportes", icon: BarChart3 },
      ],
    },
  ],
}
