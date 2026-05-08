import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data, error } = await supabase
    .from("vacunas_catalogo")
    .select("*")
    .order("vacuna_nombre", { ascending: true })

  if (error) return NextResponse.json({ error: "Error al obtener vacunas" }, { status: 500 })
  return NextResponse.json({ vacunas: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = await request.json()
  const { vacuna_id, vacuna_nombre, enfermedad_previene, grupo_pai, numero_dosis,
    dosis_descripcion, edad_aplicacion_descripcion, edad_minima_dias, edad_maxima_dias,
    intervalo_minimo_dias, via_administracion, sitio_aplicacion, dosis_ml, condicion_especial } = body

  if (!vacuna_id?.trim() || !vacuna_nombre?.trim()) {
    return NextResponse.json({ error: "El ID y el nombre son obligatorios" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("vacunas_catalogo")
    .insert({
      vacuna_id: vacuna_id.trim(),
      vacuna_nombre: vacuna_nombre.trim(),
      enfermedad_previene: enfermedad_previene?.trim() || null,
      grupo_pai: grupo_pai || null,
      numero_dosis: numero_dosis ? Number(numero_dosis) : null,
      dosis_descripcion: dosis_descripcion?.trim() || null,
      edad_aplicacion_descripcion: edad_aplicacion_descripcion?.trim() || null,
      edad_minima_dias: edad_minima_dias ? Number(edad_minima_dias) : null,
      edad_maxima_dias: edad_maxima_dias ? Number(edad_maxima_dias) : null,
      intervalo_minimo_dias: intervalo_minimo_dias ? Number(intervalo_minimo_dias) : null,
      via_administracion: via_administracion?.trim() || null,
      sitio_aplicacion: sitio_aplicacion?.trim() || null,
      dosis_ml: dosis_ml ? Number(dosis_ml) : null,
      condicion_especial: condicion_especial?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al crear vacuna: " + error.message }, { status: 500 })
  return NextResponse.json({ vacuna: data }, { status: 201 })
}
