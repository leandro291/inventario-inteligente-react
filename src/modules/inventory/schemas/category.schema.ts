import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
})

export type Category = z.infer<typeof categorySchema>
