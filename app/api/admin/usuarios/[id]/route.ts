import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const rolesValidos = ["vacunador", "coordinador", "admin"] as const

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) }
  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  return { ok: true }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const body = await request.json()
  const { rol, activo, establecimiento_id, departamento } = body as {
    rol?: string
    activo?: boolean
    establecimiento_id?: string
    departamento?: string
  }

  if (rol !== undefined && !rolesValidos.includes(rol as (typeof rolesValidos)[number])) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if (rol !== undefined) payload.rol = rol
  if (activo !== undefined) payload.activo = activo
  if (establecimiento_id !== undefined) payload.establecimiento_id = establecimiento_id
  if (departamento !== undefined) payload.departamento = departamento

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No se enviaron cambios" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios_perfil")
    .update(payload)
    .eq("id", id)
    .select("id, nombre_completo, rol, establecimiento_id, departamento, activo")
    .single()

  if (error) return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  return NextResponse.json({ usuario: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const { error } = await supabaseAdmin
    .from("usuarios_perfil")
    .update({ activo: false, eliminado: true })
    .eq("id", id)

  if (error) return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  return NextResponse.json({ ok: true })
}
