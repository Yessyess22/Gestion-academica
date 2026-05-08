import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { pacienteSchema } from "@/lib/validations/paciente"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("apellido_paterno", { ascending: true })

  if (error) return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })
  return NextResponse.json({ pacientes: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = await request.json()
  const parsed = pacienteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const pacienteId = `PAC-${Date.now()}`
  const { data, error } = await supabase
    .from("pacientes")
    .insert({ paciente_id: pacienteId, ...parsed.data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear paciente: " + error.message }, { status: 500 })
  return NextResponse.json({ paciente: data }, { status: 201 })
}
