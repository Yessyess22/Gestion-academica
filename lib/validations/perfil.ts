import { z } from "zod"

export const perfilSchema = z.object({
  nombre_completo: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120)
    .transform((v) => v.trim()),
  telefono: z
    .string()
    .max(30)
    .transform((v) => v.trim()),
})

export type PerfilFormData = z.infer<typeof perfilSchema>
