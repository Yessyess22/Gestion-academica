import { createClient } from "@/lib/supabase/server"; 
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server"; 

export async function GET() { 
  try { 
    const supabase = await createClient(); 
    const { data: { user } } = await supabase.auth.getUser(); 
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 }); 

    const supabaseAdmin = createServiceClient( 
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    ); 

    const { data: inscripciones, error } = await supabaseAdmin 
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 }); 

    return NextResponse.json({ inscripciones }); 
  } catch (err: any) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  } 
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { materia_id } = await request.json();
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from("inscripciones")
      .insert({ 
        estudiante_id: user.id, 
        materia_id, 
        estado: "activa"  // CORREGIDO: Segun tu SQL el estado debe ser 'activa'
      })
      .select(`
        id, estado, created_at,
        materia:materias!materia_id(id, codigo, nombre, creditos, semestre)
      `)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ inscripcion: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
