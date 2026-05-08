import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: perfil, error } = await supabase
    .from("usuarios_perfil")
    .select("nombre_completo, rol, telefono, avatar_url, ci, establecimiento_id, departamento")
    .eq("id", user.id)
    .single()

  if (error) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
  return NextResponse.json({ perfil })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const { nombre_completo, telefono } = body

  if (!nombre_completo || nombre_completo.trim().length < 2) {
    return NextResponse.json({ error: "El nombre debe tener al menos 2 caracteres" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("usuarios_perfil")
    .update({
      nombre_completo: nombre_completo.trim(),
      telefono: telefono?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al actualizar: " + error.message }, { status: 500 })
  return NextResponse.json({ perfil: data })
}
