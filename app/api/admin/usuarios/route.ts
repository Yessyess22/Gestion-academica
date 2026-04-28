import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) }
  }

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "admin") {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  }

  return { supabase }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) return auth.error

    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: usuarios, error } = await supabaseAdmin
      .from("usuarios_perfil")
      .select("id, nombre_completo, rol, activo, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al listar usuarios:", error)
      return NextResponse.json(
        { error: "Error al obtener usuarios" },
        { status: 500 }
      )
    }

    const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
    const usuariosConEmail = usuarios?.map((u) => {
      const authUser = authData?.users?.find((au) => au.id === u.id)
      return {
        ...u,
        email: authUser?.email || "Sin email",
      }
    })

    return NextResponse.json({ usuarios: usuariosConEmail })
  } catch (err) {
    console.error("Error inesperado:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}