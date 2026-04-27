import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const rolesValidos = ["estudiante", "docente", "admin"] as const

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireAdmin()
    if ("error" in auth) return auth.error

    const body = await request.json()
    const { rol, activo } = body as { rol?: string; activo?: boolean }

    if (rol === undefined && activo === undefined) {
      return NextResponse.json(
        { error: "No se enviaron cambios" },
        { status: 400 }
      )
    }

    if (rol !== undefined && !rolesValidos.includes(rol as (typeof rolesValidos)[number])) {
      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const payload: { rol?: string; activo?: boolean } = {}
    if (rol !== undefined) payload.rol = rol
    if (activo !== undefined) payload.activo = activo

    const { data, error } = await supabaseAdmin
      .from("usuarios_perfil")
      .update(payload)
      .eq("id", id)
      .select("id, nombre, apellido, rol, activo, created_at, updated_at")
      .single()

    if (error) {
      console.error("Error al actualizar usuario:", error)
      return NextResponse.json(
        { error: "Error al actualizar el usuario" },
        { status: 500 }
      )
    }

    return NextResponse.json({ usuario: data })
  } catch (err) {
    console.error("Error inesperado:", err)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}