import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegistrosTable } from "@/components/dashboard/vacunador/registros-table"

export default async function RegistrosVacunadorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Registros</h1>
        <p className="text-muted-foreground">Historial de vacunaciones que has registrado</p>
      </div>
      <RegistrosTable />
    </div>
  )
}
