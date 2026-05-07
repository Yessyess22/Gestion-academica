import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PerfilForm } from "@/components/dashboard/perfil-form"

export default async function PerfilVacunadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol, nombre_completo, telefono, avatar_url, ci, establecimiento_id, departamento")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Administra tu información personal</p>
      </div>
      <PerfilForm />
    </div>
  )
}
