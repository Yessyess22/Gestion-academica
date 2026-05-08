import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardVacunador } from "@/components/dashboard/vacunador/dashboard-vacunador"

export default async function VacunadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("nombre_completo, rol, establecimiento_id")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu actividad de vacunación</p>
      </div>
      <DashboardVacunador nombreUsuario={perfil.nombre_completo} establecimientoId={perfil.establecimiento_id} />
    </div>
  )
}
