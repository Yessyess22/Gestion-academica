import { createClient } from "@supabase/supabase-js" 
import { NextResponse } from "next/server" 

// Cliente admin con Service Role Key (bypasea RLS) 
const supabaseAdmin = createClient( 
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
) 

export async function POST(request: Request) { 
  try { 
    const body = await request.json() 
    const { email, password, nombre_completo, rol, carrera } = body 

    // ─── Validación básica ─── 
    if (!email || !password || !nombre_completo || !rol) { 
      return NextResponse.json( 
        { error: "Todos los campos obligatorios deben completarse" }, 
        { status: 400 } 
      ) 
    } 

    if (password.length < 6) { 
      return NextResponse.json( 
        { error: "La contraseña debe tener al menos 6 caracteres" }, 
        { status: 400 } 
      ) 
    } 

    const rolesValidos = ["estudiante", "docente", "admin"] 
    if (!rolesValidos.includes(rol)) { 
      return NextResponse.json( 
        { error: "Rol no válido" }, 
        { status: 400 } 
      ) 
    } 

    // ─── 1. Crear usuario en Supabase Auth ─── 
    const { data: authData, error: authError } = 
      await supabaseAdmin.auth.admin.createUser({ 
        email, 
        password, 
        email_confirm: false, // El usuario debe confirmar por email 
      }) 

    if (authError) { 
      return NextResponse.json( 
        { error: authError.message }, 
        { status: 400 } 
      ) 
    } 

    // ─── 2. Crear perfil en la tabla usuarios_perfil ─── 
    const { error: profileError } = await supabaseAdmin 
      .from("usuarios_perfil") 
      .insert({ 
        id: authData.user.id, // Mismo UUID que auth.users 
        nombre_completo, 
        rol, 
        carrera: carrera || null, 
      }) 

    if (profileError) { 
      // Si falla el perfil, eliminar el usuario de Auth para no dejar datos huérfanos 
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id) 

      return NextResponse.json( 
        { error: "Error al crear el perfil: " + profileError.message }, 
        { status: 500 } 
      ) 
    } 

    // ─── 3. Respuesta exitosa ─── 
    return NextResponse.json( 
      { 
        message: "Usuario registrado exitosamente", 
        user: { id: authData.user.id, email }, 
      }, 
      { status: 201 } 
    ) 
  } catch { 
    return NextResponse.json( 
      { error: "Error interno del servidor" }, 
      { status: 500 } 
    ) 
  } 
} 