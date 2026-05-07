import { z } from "zod"

export const pacienteSchema = z.object({
  ci_paciente: z.string().min(4).max(20).optional().or(z.literal("")),
  nombre_paciente: z.string().min(2, "El nombre es obligatorio").max(100),
  apellido_paterno: z.string().min(2, "El apellido paterno es obligatorio").max(100),
  apellido_materno: z.string().max(100).optional().or(z.literal("")),
  sexo: z.enum(["M", "F"], { message: "Selecciona el sexo" }),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  municipio_residencia: z.string().min(2).max(100).optional().or(z.literal("")),
  comunidad_indigena: z.boolean().default(false),
})

export type PacienteFormData = z.infer<typeof pacienteSchema>
