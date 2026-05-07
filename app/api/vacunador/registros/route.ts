import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { registroVacunacionSchema } from "@/lib/validations/registro-vacunacion"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase.from("usuarios_perfil").select("rol").eq("id", user.id).single()
  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const { data, error } = await supabase
    .from("registros_vacunacion")
    .select("*, pacientes(nombre_paciente, apellido_paterno, apellido_materno, fecha_nacimiento)")
    .eq("vacunador_id", user.id)
    .order("fecha_vacunacion", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 })
  return NextResponse.json({ registros: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data: perfil } = await supabase
    .from("usuarios_perfil")
    .select("rol, establecimiento_id")
    .eq("id", user.id)
    .single()

  if (perfil?.rol !== "vacunador") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = await request.json()
  const parsed = registroVacunacionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: vacuna } = await supabase
    .from("vacunas_catalogo")
    .select("vacuna_nombre, numero_dosis, via_administracion")
    .eq("vacuna_id", parsed.data.vacuna_id)
    .single()

  const { data: establecimiento } = await supabase
    .from("establecimientos")
    .select("nombre_establecimiento, departamento")
    .eq("establecimiento_id", perfil.establecimiento_id)
    .single()

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("fecha_nacimiento")
    .eq("paciente_id", parsed.data.paciente_id)
    .single()

  const fechaVac = new Date(parsed.data.fecha_vacunacion)
  const fechaNac = paciente ? new Date(paciente.fecha_nacimiento) : null
  const edadDias = fechaNac
    ? Math.floor((fechaVac.getTime() - fechaNac.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const registroId = `REG-${Date.now()}`

  const { data, error } = await supabase
    .from("registros_vacunacion")
    .insert({
      registro_id: registroId,
      paciente_id: parsed.data.paciente_id,
      fecha_vacunacion: parsed.data.fecha_vacunacion,
      vacuna_id: parsed.data.vacuna_id,
      vacuna_nombre: vacuna?.vacuna_nombre,
      numero_dosis: vacuna?.numero_dosis,
      establecimiento_id: perfil.establecimiento_id,
      nombre_establecimiento: establecimiento?.nombre_establecimiento,
      departamento: establecimiento?.departamento,
      lote_vacuna: parsed.data.lote_vacuna,
      temperatura_conservacion: parsed.data.temperatura_conservacion,
      edad_dias_aplicacion: edadDias,
      via_administracion: parsed.data.via_administracion ?? vacuna?.via_administracion,
      vacunador_id: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Error al registrar vacunación" }, { status: 500 })
  return NextResponse.json({ registro: data }, { status: 201 })
}
