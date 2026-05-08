import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const vacunaId = searchParams.get("vacuna_id")
  if (!vacunaId) return NextResponse.json({ lotes: [] })

  const { data, error } = await supabase
    .from("lotes_vacuna")
    .select("lote_id, lote_codigo, fecha_vencimiento, cantidad_dosis")
    .eq("vacuna_id", vacunaId)
    .eq("activo", true)
    .order("fecha_vencimiento", { ascending: true })

  if (error) return NextResponse.json({ lotes: [] })

  return NextResponse.json({ lotes: data ?? [] })
}
