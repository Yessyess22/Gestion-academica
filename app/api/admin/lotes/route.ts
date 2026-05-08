import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) }
  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  return { supabase }
}

export async function GET() {
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const { data, error } = await auth.supabase
    .from("lotes_vacuna")
    .select("*, vacunas_catalogo(vacuna_nombre)")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Error al obtener lotes" }, { status: 500 })
  return NextResponse.json({ lotes: data })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const body = await request.json()
  const { vacuna_id, lote_codigo, fecha_vencimiento, cantidad_dosis } = body

  if (!vacuna_id || !lote_codigo?.trim()) {
    return NextResponse.json({ error: "Vacuna y código de lote son obligatorios" }, { status: 400 })
  }

  const loteId = `LOT-${Date.now()}`
  const { data, error } = await auth.supabase
    .from("lotes_vacuna")
    .insert({
      lote_id: loteId,
      vacuna_id,
      lote_codigo: lote_codigo.trim().toUpperCase(),
      fecha_vencimiento: fecha_vencimiento || null,
      cantidad_dosis: cantidad_dosis ? Number(cantidad_dosis) : null,
      activo: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear lote: " + error.message }, { status: 500 })
  return NextResponse.json({ lote: data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const loteId = searchParams.get("id")
  if (!loteId) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const { error } = await auth.supabase
    .from("lotes_vacuna")
    .update({ activo: false })
    .eq("lote_id", loteId)

  if (error) return NextResponse.json({ error: "Error al desactivar lote" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
