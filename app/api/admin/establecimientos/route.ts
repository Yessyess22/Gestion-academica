import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { establecimientoSchema } from "@/lib/validations/establecimiento"

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

  const { data, error } = await supabaseAdmin
    .from("establecimientos")
    .select("*")
    .order("departamento", { ascending: true })

  if (error) return NextResponse.json({ error: "Error al obtener establecimientos" }, { status: 500 })
  return NextResponse.json({ establecimientos: data })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ("error" in auth) return auth.error

  const body = await request.json()
  const parsed = establecimientoSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("establecimientos")
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear establecimiento" }, { status: 500 })
  return NextResponse.json({ establecimiento: data }, { status: 201 })
}
