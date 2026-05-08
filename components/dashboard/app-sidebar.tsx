"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Syringe, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { navigationConfig, type NavGroup } from "@/lib/navigation"

interface AppSidebarProps {
  rol: string
  nombreUsuario: string
}

export function AppSidebar({ rol, nombreUsuario }: AppSidebarProps) {
  const pathname = usePathname()
  const navGroups: NavGroup[] = navigationConfig[rol] || []

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${rol}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Syringe className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Sistema PAI</span>
                  <span className="text-xs text-muted-foreground">
                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Info del usuario */}
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${rol}/perfil`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <span className="text-sm font-medium">
                    {nombreUsuario.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-sm font-medium truncate max-w-[140px]">{nombreUsuario}</span>
                  <span className="text-xs text-muted-foreground capitalize">{rol}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Botón cerrar sesión */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar sesión"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
