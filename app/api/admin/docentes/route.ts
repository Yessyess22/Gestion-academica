import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from("usuarios_perfil")
      .select("rol")
      .eq("id", user.id)
      .single()

    if (perfil?.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: docentes, error } = await supabaseAdmin
      .from("usuarios_perfil")
      .select("id, nombre, apellido")
      .eq("rol", "docente")
      .eq("activo", true)
      .order("apellido", { ascending: true })

    if (error) {
      console.error("Error al listar docentes:", error)
      return NextResponse.json(
        { error: "Error al obtener docentes" },
        { status: 500 }
      )
    }

    return NextResponse.json({ docentes })
  } catch (err) {
    console.error("Error inesperado:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}