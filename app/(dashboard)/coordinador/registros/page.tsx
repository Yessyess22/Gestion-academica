import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegistrosCoordinador } from "@/components/dashboard/coordinador/registros-coordinador"

export default async function RegistrosCoordinadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "coordinador") redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registros de Vacunación</h1>
        <p className="text-muted-foreground">Todos los registros de tu departamento</p>
      </div>
      <RegistrosCoordinador />
    </div>
  )
}
