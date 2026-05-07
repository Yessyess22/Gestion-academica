import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data, error } = await supabase
    .from("vacunas_catalogo")
    .select("*")
    .order("vacuna_nombre", { ascending: true })

  if (error) return NextResponse.json({ error: "Error al obtener vacunas" }, { status: 500 })
  return NextResponse.json({ vacunas: data })
}
