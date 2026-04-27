import { createClient } from "@/lib/supabase/server"; 

  import { NextResponse } from "next/server"; 

   

  export async function GET() { 

    try { 

      // 1. Verificar autenticación 

      const supabase = await createClient(); 

      const { 

        data: { user }, 

        error: authError, 

      } = await supabase.auth.getUser(); 

   

      if (authError || !user) { 

        return NextResponse.json({ error: "No autenticado" }, { status: 401 }); 

      } 

   

      // 2. Verificar que es estudiante 

      const { data: perfil } = await supabase 

        .from("usuarios_perfil") 

        .select("rol") 

        .eq("id", user.id) 

        .single(); 

   

      if (perfil?.rol !== "estudiante") { 

        return NextResponse.json({ error: "No autorizado" }, { status: 403 }); 

      } 

   

      // 3. Obtener todas las materias con datos del docente 

      const { data: materias, error } = await supabase 

        .from("materias") 

        .select(` 

          id, codigo, nombre, creditos, semestre, created_at, 

          docente:usuarios_perfil!docente_id(id, nombre, apellido) 

        `) 

        .order("nombre", { ascending: true }); 

   

      if (error) { 

        console.error("Error al listar catálogo:", error); 

        return NextResponse.json({ error: "Error al obtener materias" }, { status: 500 }); 

      } 

   

      return NextResponse.json({ materias }); 

    } catch (err) { 

      console.error("Error inesperado:", err); 

      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 }); 

    } 

  } 