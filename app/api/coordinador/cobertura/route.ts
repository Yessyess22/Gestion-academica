import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol, departamento")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "coordinador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data: registros, error } = await supabase
    .from("registros_vacunacion")
    .select("vacuna_nombre, aplicacion_oportuna, nombre_establecimiento")
    .eq("departamento", perfil.departamento)

  if (error) return NextResponse.json({ error: "Error al calcular cobertura" }, { status: 500 })

  // Agrupar por vacuna
  const cobertura: Record<string, { total: number; oportunas: number }> = {}
  for (const reg of registros ?? []) {
    const vacuna = reg.vacuna_nombre ?? "Sin nombre"
    if (!cobertura[vacuna]) cobertura[vacuna] = { total: 0, oportunas: 0 }
    cobertura[vacuna].total++
    if (reg.aplicacion_oportuna) cobertura[vacuna].oportunas++
  }

  const resumen = Object.entries(cobertura).map(([vacuna, data]) => ({
    vacuna,
    total: data.total,
    oportunas: data.oportunas,
    porcentaje_oportuno: data.total > 0 ? Math.round((data.oportunas / data.total) * 100) : 0,
  }))

  return NextResponse.json({ cobertura: resumen })
}
