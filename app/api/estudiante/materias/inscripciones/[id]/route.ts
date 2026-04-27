import { createClient } from "@/lib/supabase/server"; 

  import { NextRequest, NextResponse } from "next/server"; 

   

  export async function PUT( 

    request: NextRequest, 

    { params }: { params: Promise<{ id: string }> } 

  ) { 

    try { 

      const { id } = await params; 

   

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

   

      // 3. Obtener la inscripción actual 

      const { data: inscripcion } = await supabase 

        .from("inscripciones") 

        .select("id, estado, estudiante_id") 

        .eq("id", id) 

        .single(); 

   

      if (!inscripcion) { 

        return NextResponse.json( 

          { error: "Inscripción no encontrada" }, 

          { status: 404 } 

        ); 

      } 

   

      // 4. Verificar que le pertenece 

      if (inscripcion.estudiante_id !== user.id) { 

        return NextResponse.json( 

          { error: "No puedes modificar inscripciones de otro estudiante" }, 

          { status: 403 } 

        ); 

      } 

   

      // 5. Verificar que está inscrito (no ya retirado) 

      if (inscripcion.estado !== "inscrito") { 

        return NextResponse.json( 

          { error: "Esta inscripción ya fue retirada" }, 

          { status: 400 } 

        ); 

      } 

   

      // 6. Actualizar estado a retirado 

      const { data, error } = await supabase 

        .from("inscripciones") 

        .update({ estado: "retirado" }) 

        .eq("id", id) 

        .select(` 

          id, estado, created_at, 

          materia:materias!materia_id(id, codigo, nombre) 

        `) 

        .single(); 

   

      if (error) { 

        console.error("Error al retirar inscripción:", error); 

        return NextResponse.json( 

          { error: "Error al procesar el retiro" }, 

          { status: 500 } 

        ); 

      } 

   

      return NextResponse.json({ inscripcion: data }); 

    } catch (err) { 

      console.error("Error inesperado:", err); 

      return NextResponse.json( 

        { error: "Error interno del servidor" }, 

        { status: 500 } 

      ); 

    } 

  } 