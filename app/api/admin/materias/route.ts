import { createClient } from "@/lib/supabase/server" 
import { createClient as createServiceClient } from "@supabase/supabase-js" 
import { NextResponse } from "next/server" 

import { materiaSchema } from "@/lib/validations/materia" 

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

    const { data: materias, error } = await supabaseAdmin 
      .from("materias") 
      .select(` 
        id, codigo, nombre, creditos, semestre, docente_id, created_at, 
        docente:usuarios_perfil!docente_id(id, nombre_completo) 
      `) 
      .order("created_at", { ascending: false }) 

    if (error) { 
      console.error("Error al listar materias:", error) 
      return NextResponse.json( 
        { error: "Error al obtener materias" }, 
        { status: 500 } 
      ) 
    } 

    return NextResponse.json({ materias }) 
  } catch (err) { 
    console.error("Error inesperado:", err) 
    return NextResponse.json( 
      { error: "Error interno del servidor" }, 
      { status: 500 } 
    ) 
  } 
} 

export async function POST(request: Request) { 
  try { 
    const auth = await requireAdmin() 
    if ("error" in auth) return auth.error 

    const body = await request.json() 
    const resultado = materiaSchema.safeParse(body) 

    if (!resultado.success) { 
      const errores = resultado.error.issues.map((issue) => ({ 
        campo: issue.path.join("."), 
        mensaje: issue.message, 
      })) 
      return NextResponse.json( 
        { error: "Datos inválidos", errores }, 
        { status: 400 } 
      ) 
    } 

    const supabaseAdmin = createServiceClient( 
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    ) 

    const { data, error } = await supabaseAdmin 
      .from("materias") 
      .insert({ 
        codigo: resultado.data.codigo, 
        nombre: resultado.data.nombre, 
        creditos: resultado.data.creditos, 
        semestre: resultado.data.semestre, 
        docente_id: resultado.data.docente_id || null, 
      }) 
      .select(` 
        id, codigo, nombre, creditos, semestre, docente_id, created_at, 
        docente:usuarios_perfil!docente_id(id, nombre_completo) 
      `) 
      .single() 

    if (error) { 
      console.error("Error al crear materia:", error) 
      if (error.code === "23505") { 
        return NextResponse.json( 
          { error: "Ya existe otra materia con ese código" }, 
          { status: 409 } 
        ) 
      } 

      return NextResponse.json( 
        { error: "Error al crear la materia" }, 
        { status: 500 } 
      ) 
    } 

    return NextResponse.json({ materia: data }, { status: 201 }) 
  } catch (err) { 
    console.error("Error inesperado:", err) 
    return NextResponse.json( 
      { error: "Error interno del servidor" }, 
      { status: 500 } 
    ) 
  } 
} 