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

  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  const [totalMes, totalAcumulado, establecimientos, vacunasAplicadas] = await Promise.all([
    supabase
      .from("registros_vacunacion")
      .select("registro_id", { count: "exact", head: true })
      .eq("departamento", perfil.departamento)
      .gte("fecha_vacunacion", primerDiaMes),
    supabase
      .from("registros_vacunacion")
      .select("registro_id", { count: "exact", head: true })
      .eq("departamento", perfil.departamento),
    supabase
      .from("establecimientos")
      .select("establecimiento_id", { count: "exact", head: true })
      .eq("departamento", perfil.departamento)
      .eq("activo", true),
    supabase
      .from("registros_vacunacion")
      .select("vacuna_nombre")
      .eq("departamento", perfil.departamento),
  ])

  const vacunasUnicas = new Set(vacunasAplicadas.data?.map((r) => r.vacuna_nombre) ?? []).size

  return NextResponse.json({
    stats: {
      dosisMes: totalMes.count ?? 0,
      dosisAcumuladas: totalAcumulado.count ?? 0,
      establecimientos: establecimientos.count ?? 0,
      vacunasAplicadas: vacunasUnicas,
      departamento: perfil.departamento,
    },
  })
}
