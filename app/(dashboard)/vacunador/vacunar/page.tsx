import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RegistrarVacunaForm } from "@/components/dashboard/vacunador/registrar-vacuna-form"

export default async function VacunarPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">Registrar Vacunación</h1>
        <p className="text-muted-foreground">Busca al paciente y registra la dosis aplicada</p>
      </div>
      <RegistrarVacunaForm />
    </div>
  )
}
