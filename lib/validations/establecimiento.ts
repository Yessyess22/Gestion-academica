import { z } from "zod"

export const establecimientoSchema = z.object({
  establecimiento_id: z
    .string()
    .min(3)
    .max(20)
    .regex(/^EST-[A-Z]{2}-\d{4}$/, "Formato: EST-SC-0001"),
  nombre_establecimiento: z.string().min(3).max(200),
  tipo_establecimiento: z.enum([
    "Hospital 3er Nivel",
    "Hospital 2do Nivel",
    "Centro de Salud",
    "Posta de Salud",
  ]),
  nivel_atencion: z.number().int().min(1).max(3),
  zona: z.enum(["Urbana", "Periurbana", "Rural"]),
  sedes: z.string().min(2).max(100),
  red_salud: z.string().min(2).max(100),
  departamento: z.string().min(2).max(100),
  municipio: z.string().min(2).max(100),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  tiene_cadena_frio: z.boolean().default(false),
  activo: z.boolean().default(true),
})

export type EstablecimientoFormData = z.infer<typeof establecimientoSchema>
