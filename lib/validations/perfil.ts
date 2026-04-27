import { z } from "zod"

export const perfilSchema = z.object({
  nombre_completo: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres")
    .transform((value) => value.trim()),
  telefono: z
    .string()
    .max(30, "El teléfono no puede exceder 30 caracteres")
    .transform((value) => value.trim()),
  carrera: z
    .string()
    .max(120, "La carrera no puede exceder 120 caracteres")
    .transform((value) => value.trim()),
})

export type PerfilFormData = z.infer<typeof perfilSchema>