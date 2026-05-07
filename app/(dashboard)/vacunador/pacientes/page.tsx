import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PacientesTable } from "@/components/dashboard/vacunador/pacientes-table"

export default async function PacientesPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">Mis Pacientes</h1>
        <p className="text-muted-foreground">Pacientes registrados en tu establecimiento</p>
      </div>
      <PacientesTable />
    </div>
  )
}
