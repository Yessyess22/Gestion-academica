import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol, establecimiento_id")
    .eq("id", user.id)
    .single()
  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const [{ data: vacunas, error }, { data: establecimiento }] = await Promise.all([
    supabase.from("vacunas_catalogo").select("*").order("vacuna_nombre", { ascending: true }),
    perfil.establecimiento_id
      ? supabase
          .from("establecimientos")
          .select("nombre_establecimiento, departamento")
          .eq("establecimiento_id", perfil.establecimiento_id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  if (error) return NextResponse.json({ error: "Error al obtener vacunas" }, { status: 500 })
  return NextResponse.json({ vacunas, establecimiento })
}
