import { z } from "zod"

export const registroVacunacionSchema = z.object({
  paciente_id: z.string().min(1, "Selecciona un paciente"),
  vacuna_id: z.string().min(1, "Selecciona una vacuna"),
  fecha_vacunacion: z.string().min(1, "La fecha es obligatoria"),
  lote_vacuna: z.string().min(2, "El lote es obligatorio").max(50),
  temperatura_conservacion: z.number().min(-10).max(30).optional().nullable(),
  via_administracion: z.string().min(2).max(50),
  aplicacion_oportuna: z.boolean().optional().nullable(),
})

export type RegistroVacunacionFormData = z.infer<typeof registroVacunacionSchema>
