import { z } from "zod"

export const materiaSchema = z.object({
  codigo: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(10, "El código no puede exceder 10 caracteres")
    .regex(/^[A-Z0-9-]+$/, "Solo mayúsculas, números y guiones")
    .transform((value) => value.toUpperCase()),

  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform((value) => value.trim()),

  creditos: z
    .number()
    .int("Los créditos deben ser un número entero")
    .min(1, "Mínimo 1 crédito")
    .max(10, "Máximo 10 créditos"),

  semestre: z
    .string()
    .min(1, "El semestre es obligatorio")
    .max(20, "El semestre no puede exceder 20 caracteres"),

  docente_id: z
    .string()
    .uuid("ID de docente inválido")
    .nullable()
    .optional(),
})

export type MateriaFormData = z.infer<typeof materiaSchema>