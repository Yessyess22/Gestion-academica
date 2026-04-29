import { createClient } from "@/lib/supabase/server"; 
import { NextResponse } from "next/server"; 

export async function GET() { 
  try { 
    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser(); 
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 }); 

    const { data: perfil } = await supabase 
      .from("usuarios_perfil") 
      .select("rol") 
      .eq("id", user.id) 
      .single(); 

    if (perfil?.rol !== "docente") return NextResponse.json({ error: "No autorizado" }, { status: 403 }); 

    // Obtener materias del docente 
    const { data: materias, error: errMaterias } = await supabase 
      .from("materias") 
      .select("id, codigo, nombre, creditos, semestre") 
      .eq("docente_id", user.id) 
      .order("codigo", { ascending: true }); 

    if (errMaterias) return NextResponse.json({ error: "Error al obtener materias" }, { status: 500 }); 

    const materiaIds = materias?.map((m) => m.id) || []; 
    if (materiaIds.length === 0) return NextResponse.json({ materias: [] }); 

    // Obtener inscripciones usando el estado 'activa'
    const { data: inscripciones, error: errInsc } = await supabase 
      .from("inscripciones") 
      .select(` 
        id, estado, created_at, materia_id, 
        estudiante:usuarios_perfil!estudiante_id(id, nombre_completo) 
      `) 
      .in("materia_id", materiaIds) 
      .order("created_at", { ascending: true }); 

    if (errInsc) return NextResponse.json({ error: "Error al obtener inscripciones" }, { status: 500 }); 

    const materiasConInscritos = materias?.map((m) => ({ 
      ...m, 
      inscripciones: inscripciones?.filter((i) => i.materia_id === m.id) || [], 
      totalInscritos: inscripciones?.filter((i) => i.materia_id === m.id && i.estado === "activa").length || 0, 
    })); 

    return NextResponse.json({ materias: materiasConInscritos }); 
  } catch (err: any) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  } 
}
