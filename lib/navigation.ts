import { 
  BookOpen, 
  ClipboardList, 
  LayoutDashboard, 
  Settings, 
  Users, 
  UserCircle, 
} from "lucide-react" 

export type NavItem = { 
  title: string 
  url: string 
  icon: typeof LayoutDashboard 
} 

export type NavGroup = { 
  label: string 
  items: NavItem[] 
} 

// Navegación para cada rol 
export const navigationConfig: Record<string, NavGroup[]> = { 
  estudiante: [ 
    { 
      label: "Principal", 
      items: [ 
        { title: "Dashboard", url: "/estudiante", icon: LayoutDashboard }, 
        { title: "Materias", url: "/estudiante/materias", icon: BookOpen }, 
        { 
          title: "Mis Inscripciones", 
          url: "/estudiante/inscripciones", 
          icon: ClipboardList, 
        }, 
      ], 
    }, 
    { 
      label: "Cuenta", 
      items: [ 
        { title: "Mi Perfil", url: "/estudiante/perfil", icon: UserCircle }, 
      ], 
    }, 
  ], 
  docente: [ 
    { 
      label: "Principal", 
      items: [ 
        { title: "Dashboard", url: "/docente", icon: LayoutDashboard }, 
        { title: "Mis Materias", url: "/docente/materias", icon: BookOpen }, 
      ], 
    }, 
    { 
      label: "Cuenta", 
      items: [ 
        { title: "Mi Perfil", url: "/docente/perfil", icon: UserCircle }, 
      ], 
    }, 
  ], 
  admin: [ 
    { 
      label: "Principal", 
      items: [ 
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard }, 
        { title: "Usuarios", url: "/admin/usuarios", icon: Users }, 
        { title: "Materias", url: "/admin/materias", icon: BookOpen }, 
        { 
          title: "Inscripciones", 
          url: "/admin/inscripciones", 
          icon: ClipboardList, 
        }, 
      ], 
    }, 
    { 
      label: "Sistema", 
      items: [ 
        { title: "Configuración", url: "/admin/config", icon: Settings }, 
      ], 
    }, 
  ], 
} 