import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  const [totalRegistros, dosisMes, totalPacientes, totalEstablecimientos, sinCadenaFrio] = await Promise.all([
    supabase.from("registros_vacunacion").select("registro_id", { count: "exact", head: true }),
    supabase.from("registros_vacunacion").select("registro_id", { count: "exact", head: true }).gte("fecha_vacunacion", primerDiaMes),
    supabase.from("pacientes").select("paciente_id", { count: "exact", head: true }),
    supabase.from("establecimientos").select("establecimiento_id", { count: "exact", head: true }).eq("activo", true),
    supabase.from("establecimientos").select("establecimiento_id", { count: "exact", head: true }).eq("tiene_cadena_frio", false).eq("activo", true),
  ])

  return NextResponse.json({
    stats: {
      totalDosis: totalRegistros.count ?? 0,
      dosisMes: dosisMes.count ?? 0,
      totalPacientes: totalPacientes.count ?? 0,
      totalEstablecimientos: totalEstablecimientos.count ?? 0,
      sinCadenaFrio: sinCadenaFrio.count ?? 0,
    },
  })
}
