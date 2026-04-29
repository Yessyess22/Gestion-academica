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

    const { data: materias, error } = await supabaseAdmin 
      .from("materias") 
      .select(`
        id, codigo, nombre, creditos, semestre,
        docente:usuarios_perfil!docente_id(id, nombre_completo)
      `)
      .order("nombre", { ascending: true }); 

    if (error) return NextResponse.json({ error: error.message }, { status: 500 }); 

    return NextResponse.json({ materias }); 
  } catch (err: any) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  } 
}
