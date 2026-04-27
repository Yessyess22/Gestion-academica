import { NextResponse } from "next/server" 
import { createClient } from "@/lib/supabase/server" 

export async function PUT(request: Request) { 
  try { 
    const supabase = await createClient() 

    // 1. Verificar que el usuario está autenticado 
    const { 
      data: { user }, 
    } = await supabase.auth.getUser() 

    if (!user) { 
      return NextResponse.json( 
        { error: "No autorizado" }, 
        { status: 401 } 
      ) 
    } 

    // 2. Leer el body de la petición 
    const body = await request.json() 
    const { nombre_completo, telefono, carrera } = body 

    // 3. Validar campos obligatorios 
    if (!nombre_completo || nombre_completo.trim().length < 2) { 
      return NextResponse.json( 
        { error: "El nombre debe tener al menos 2 caracteres" }, 
        { status: 400 } 
      ) 
    } 

    // 4. Actualizar el perfil 
    const { data, error } = await supabase 
      .from("usuarios_perfil") 
      .update({ 
        nombre_completo: nombre_completo.trim(), 
        telefono: telefono?.trim() || null, 
        carrera: carrera?.trim() || null, 
      }) 
      .eq("id", user.id) 
      .select() 
      .single() 

    if (error) { 
      return NextResponse.json( 
        { error: "Error al actualizar: " + error.message }, 
        { status: 500 } 
      ) 
    } 

    return NextResponse.json({ perfil: data }) 
  } catch { 
    return NextResponse.json( 
      { error: "Error interno del servidor" }, 
      { status: 500 } 
    ) 
  } 
} 

export async function GET() { 
  try { 
    const supabase = await createClient() 

    const { 
      data: { user }, 
    } = await supabase.auth.getUser() 

    if (!user) {
      return NextResponse.json( 
        { error: "No autorizado" }, 
        { status: 401 } 
      ) 
    } 

    const { data: perfil, error } = await supabase 
      .from("usuarios_perfil") 
      .select("*") 
      .eq("id", user.id) 
      .single() 

    if (error) { 
      return NextResponse.json( 
        { error: "Perfil no encontrado" }, 
        { status: 404 } 
      ) 
    } 

    return NextResponse.json({ perfil }) 
  } catch { 
    return NextResponse.json( 
      { error: "Error interno del servidor" }, 
      { status: 500 } 
    ) 
  } 
} 