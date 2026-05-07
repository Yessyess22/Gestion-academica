import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data: registros, error } = await supabase
    .from("registros_vacunacion")
    .select("vacuna_nombre, departamento, aplicacion_oportuna, fecha_vacunacion")

  if (error) return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })

  // Cobertura por departamento
  const porDepto: Record<string, { total: number; oportunas: number }> = {}
  for (const r of registros ?? []) {
    const depto = r.departamento ?? "Sin departamento"
    if (!porDepto[depto]) porDepto[depto] = { total: 0, oportunas: 0 }
    porDepto[depto].total++
    if (r.aplicacion_oportuna) porDepto[depto].oportunas++
  }

  // Cobertura por vacuna nacional
  const porVacuna: Record<string, number> = {}
  for (const r of registros ?? []) {
    const v = r.vacuna_nombre ?? "Sin nombre"
    porVacuna[v] = (porVacuna[v] ?? 0) + 1
  }

  return NextResponse.json({
    cobertura_departamento: Object.entries(porDepto).map(([departamento, d]) => ({
      departamento,
      total: d.total,
      oportunas: d.oportunas,
      porcentaje: d.total > 0 ? Math.round((d.oportunas / d.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total),
    dosis_por_vacuna: Object.entries(porVacuna)
      .map(([vacuna, total]) => ({ vacuna, total }))
      .sort((a, b) => b.total - a.total),
  })
}
