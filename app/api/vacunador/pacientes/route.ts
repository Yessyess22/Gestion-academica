import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { pacienteSchema } from "@/lib/validations/paciente"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const ci = searchParams.get("ci")

  let query = supabase
    .from("pacientes")
    .select("*")
    .order("apellido_paterno", { ascending: true })

  if (ci) query = query.ilike("ci_paciente", `%${ci}%`)

  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })

  return NextResponse.json({ pacientes: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (!["vacunador", "admin"].includes(perfil?.rol ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = pacienteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const pacienteId = `PAC-${Date.now()}`
  const { data, error } = await supabase
    .from("pacientes")
    .insert({ paciente_id: pacienteId, ...parsed.data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 })
  return NextResponse.json({ paciente: data }, { status: 201 })
}
