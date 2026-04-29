import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const supabaseAdmin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const [usuarios, materias, inscripciones, inscritas] = await Promise.all([
      supabaseAdmin.from("usuarios_perfil").select("rol, activo"),
      supabaseAdmin.from("materias").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("inscripciones").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("inscripciones").select("id", { count: "exact", head: true }).eq("estado", "activa"),
    ]);

    const perfiles = usuarios.data || [];
    return NextResponse.json({
      stats: {
        totalUsuarios: perfiles.length,
        totalEstudiantes: perfiles.filter((u) => u.rol === "estudiante").length,
        totalDocentes: perfiles.filter((u) => u.rol === "docente").length,
        totalAdmins: perfiles.filter((u) => u.rol === "admin").length,
        totalActivos: perfiles.filter((u) => u.activo).length,
        totalInactivos: perfiles.filter((u) => !u.activo).length,
        totalMaterias: materias.count || 0,
        totalInscripciones: inscripciones.count || 0,
        inscripcionesActivas: inscritas.count || 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
