import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios_perfil")
    .select("nombre_completo, rol")
    .eq("id", user.id)
    .single()

  if (!perfil) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar
        rol={perfil.rol}
        nombreUsuario={perfil.nombre_completo}
      />
      <SidebarInset>
        {/* ─── Header mejorado ─── */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <span className="text-sm font-medium">
            {perfil.rol.charAt(0).toUpperCase() + perfil.rol.slice(1)}
          </span>

          {/* Header con dropdown se posiciona a la derecha (ml-auto) */}
          <DashboardHeader
            nombreUsuario={perfil.nombre_completo}
            email={user.email || ""}
            rol={perfil.rol}
          />
        </header>

        {/* ─── Contenido principal ─── */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}