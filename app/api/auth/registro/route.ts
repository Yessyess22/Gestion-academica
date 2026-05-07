import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password, nombre_completo, rol, establecimiento_id, departamento, ci } = body

  if (!email || !password || !nombre_completo || !rol) {
    return NextResponse.json({ error: "Todos los campos obligatorios deben completarse" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
  }

  const rolesValidos = ["vacunador", "coordinador", "admin"]
  if (!rolesValidos.includes(rol)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { error: profileError } = await supabaseAdmin.from("usuarios_perfil").insert({
    id: authData.user.id,
    nombre_completo,
    rol,
    establecimiento_id: establecimiento_id || null,
    departamento: departamento || null,
    ci: ci || null,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: "Error al crear el perfil: " + profileError.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Usuario registrado exitosamente", user: { id: authData.user.id, email } }, { status: 201 })
}
