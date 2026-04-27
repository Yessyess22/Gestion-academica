"use client" 

import Link from "next/link" 
import { usePathname } from "next/navigation" 
import { GraduationCap } from "lucide-react" 

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
} from "@/components/ui/sidebar" 

import { navigationConfig, type NavGroup } from "@/lib/navigation" 

interface AppSidebarProps { 
  rol: string 
  nombreUsuario: string 
} 

export function AppSidebar({ rol, nombreUsuario }: AppSidebarProps) { 
  const pathname = usePathname() 
  
  // Obtener los grupos de navegación según el rol 
  const navGroups: NavGroup[] = navigationConfig[rol] || [] 

  return ( 
    <Sidebar collapsible="icon"> 
      {/* ─── Header del sidebar: Logo + nombre ─── */} 
      <SidebarHeader> 
        <SidebarMenu> 
          <SidebarMenuItem> 
            <SidebarMenuButton size="lg" asChild> 
              <Link href={`/${rol}`}> 
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"> 
                  <GraduationCap className="size-4" /> 
                </div> 
                <div className="flex flex-col gap-0.5 leading-none"> 
                  <span className="font-semibold">Gestión Académica</span> 
                  <span className="text-xs text-muted-foreground"> 
                    {rol.charAt(0).toUpperCase() + rol.slice(1)} 
                  </span> 
                </div> 
              </Link> 
            </SidebarMenuButton> 
          </SidebarMenuItem> 
        </SidebarMenu> 
      </SidebarHeader> 

      {/* ─── Contenido: grupos de navegación ─── */} 
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

      {/* ─── Footer: nombre del usuario ─── */} 
      <SidebarFooter> 
        <SidebarMenu> 
          <SidebarMenuItem> 
            <SidebarMenuButton size="lg"> 
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted"> 
                <span className="text-sm font-medium"> 
                  {nombreUsuario.charAt(0).toUpperCase()} 
                </span> 
              </div> 
              <div className="flex flex-col gap-0.5 leading-none"> 
                <span className="text-sm font-medium">{nombreUsuario}</span> 
                <span className="text-xs text-muted-foreground">{rol}</span> 
              </div> 
            </SidebarMenuButton> 
          </SidebarMenuItem> 
        </SidebarMenu> 
      </SidebarFooter> 

      <SidebarRail /> 
    </Sidebar> 
  ) 
} 