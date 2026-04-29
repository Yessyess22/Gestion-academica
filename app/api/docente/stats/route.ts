import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "docente") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { data: materias } = await supabase.from("materias").select("id, creditos").eq("docente_id", user.id);
    const totalMaterias = materias?.length || 0;
    const totalCreditos = materias?.reduce((sum, m) => sum + m.creditos, 0) || 0;

    const materiaIds = materias?.map((m) => m.id) || [];
    let totalInscritos = 0;
    if (materiaIds.length > 0) {
      const { count } = await supabase.from("inscripciones").select("id", { count: "exact", head: true }).in("materia_id", materiaIds).eq("estado", "activa");
      totalInscritos = count || 0;
    }

    const promedio = totalMaterias > 0 ? Math.round((totalInscritos / totalMaterias) * 10) / 10 : 0;

    return NextResponse.json({
      stats: {
        totalMaterias,
        totalCreditos,
        totalInscritos,
        promedioEstudiantesPorMateria: promedio,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
