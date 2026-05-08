import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardCoordinador } from "@/components/dashboard/coordinador/dashboard-coordinador"

export default async function CoordinadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("nombre_completo, rol, departamento")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "coordinador") redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de vacunación de tu departamento</p>
      </div>
      <DashboardCoordinador nombreUsuario={perfil.nombre_completo} departamento={perfil.departamento ?? ""} />
    </div>
  )
}
