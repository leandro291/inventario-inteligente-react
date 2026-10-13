import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
})

export type Category = z.infer<typeof categorySchema>

// Espejo de CategoryCreate del back.
const NOMBRE_MSG = 'Entre 3 y 100 caracteres.'

export const categoryCreateSchema = z.object({
  nombre: z.string().trim().min(3, NOMBRE_MSG).max(100, NOMBRE_MSG),
})

export type CategoryCreate = z.infer<typeof categoryCreateSchema>
