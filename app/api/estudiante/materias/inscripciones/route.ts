 import { createClient } from "@/lib/supabase/server"; 

  import { NextResponse } from "next/server"; 

   // ===== GET: Mis inscripciones ===== 

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

   

      // 3. Obtener inscripciones con datos de materia y docente 

      const { data: inscripciones, error } = await supabase 

        .from("inscripciones") 

        .select(` 

          id, estado, created_at, 

          materia:materias!materia_id( 

            id, codigo, nombre, creditos, semestre, 

            docente:usuarios_perfil!docente_id(nombre_completo) 

          ) 

        `) 

        .eq("estudiante_id", user.id) 

        .order("created_at", { ascending: false }); 

   

      if (error) { 

        console.error("Error al obtener inscripciones:", error); 

        return NextResponse.json( 

          { error: "Error al obtener inscripciones" }, 

          { status: 500 } 

        ); 

      } 

   

      return NextResponse.json({ inscripciones }); 

    } catch (err) { 

      console.error("Error inesperado:", err); 

      return NextResponse.json( 

        { error: "Error interno del servidor" }, 

        { status: 500 } 

      ); 

    } 

  } 

  // ===== POST: Inscribirse a una materia ===== 

  export async function POST(request: Request) { 

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

   

      // 3. Leer materia_id del body 

      const body = await request.json(); 

      const { materia_id } = body; 

   

      if (!materia_id) { 

        return NextResponse.json( 

          { error: "materia_id es requerido" }, 

          { status: 400 } 

        ); 

      } 

   

      // 4. Verificar que la materia existe 

      const { data: materia } = await supabase 

        .from("materias") 

        .select("id, codigo, nombre") 

        .eq("id", materia_id) 

        .single(); 

   

      if (!materia) { 

        return NextResponse.json( 

          { error: "La materia no existe" }, 

          { status: 404 } 

        ); 

      } 

   

      // 5. Intentar insertar la inscripción 

      const { data, error } = await supabase 

        .from("inscripciones") 

        .insert({ 

          estudiante_id: user.id, 

          materia_id: materia_id, 

          estado: "inscrito", 

        }) 

        .select(` 

          id, estado, created_at, 

          materia:materias!materia_id(id, codigo, nombre, creditos, semestre) 

        `) 

        .single(); 

   

      if (error) { 

        console.error("Error al inscribirse:", error); 

   

        // UNIQUE violation: ya inscrito 

        if (error.code === "23505") { 

          return NextResponse.json( 

            { error: "Ya estás inscrito en esta materia" }, 

            { status: 409 } 

          ); 

        } 

   

        return NextResponse.json( 

          { error: "Error al procesar la inscripción" }, 

          { status: 500 } 

        ); 

      } 

   

      return NextResponse.json({ inscripcion: data }, { status: 201 }); 

    } catch (err) { 

      console.error("Error inesperado:", err); 

      return NextResponse.json( 

        { error: "Error interno del servidor" }, 

        { status: 500 } 

      ); 

    } 

  } 