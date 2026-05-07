import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

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

export async function GET() {
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const { data: usuarios, error } = await supabaseAdmin
    .from("usuarios_perfil")
    .select("id, nombre_completo, rol, establecimiento_id, departamento, ci, activo, created_at")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 })

  const { data: authData } = await supabaseAdmin.auth.admin.listUsers()
  const usuariosConEmail = usuarios?.map((u) => ({
    ...u,
    email: authData?.users?.find((au) => au.id === u.id)?.email ?? "Sin email",
  }))

  return NextResponse.json({ usuarios: usuariosConEmail })
}
