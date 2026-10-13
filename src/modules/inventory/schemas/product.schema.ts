import { z } from 'zod'

export const productSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  precio: z.number(),
  stock: z.number().int().min(0),
  category_id: z.number().int().positive(),
})

export type Product = z.infer<typeof productSchema>
