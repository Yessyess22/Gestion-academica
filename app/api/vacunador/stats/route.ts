import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol, establecimiento_id")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const hoy = new Date().toISOString().split("T")[0]
  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  const [dosisHoy, dosisMes, totalPacientes] = await Promise.all([
    supabase
      .from("registros_vacunacion")
      .select("registro_id", { count: "exact", head: true })
      .eq("vacunador_id", user.id)
      .eq("fecha_vacunacion", hoy),
    supabase
      .from("registros_vacunacion")
      .select("registro_id", { count: "exact", head: true })
      .eq("vacunador_id", user.id)
      .gte("fecha_vacunacion", primerDiaMes),
    supabase
      .from("registros_vacunacion")
      .select("paciente_id")
      .eq("vacunador_id", user.id),
  ])

  const pacientesUnicos = new Set(totalPacientes.data?.map((r) => r.paciente_id) ?? []).size

  return NextResponse.json({
    stats: {
      dosisHoy: dosisHoy.count ?? 0,
      dosisMes: dosisMes.count ?? 0,
      pacientesAtendidos: pacientesUnicos,
      establecimiento_id: perfil.establecimiento_id,
    },
  })
}
