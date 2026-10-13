import { z } from 'zod'

export const productSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  precio: z.number(),
  stock: z.number().int().min(0),
  category_id: z.number().int().positive(),
})

export type Product = z.infer<typeof productSchema>

// Espejo de ProductCreate del back. Los inputs numéricos (valueAsNumber) entregan
// NaN si están vacíos: `error` de z.number() lo convierte en el mensaje de la regla.
const NOMBRE_MSG = 'Entre 3 y 100 caracteres.'
const PRECIO_MSG = 'Tiene que ser mayor a 0.'
const STOCK_MSG = 'Tiene que ser un entero ≥ 0.'
const CATEGORY_MSG = 'Elegí una categoría.'

export const productCreateSchema = z.object({
  nombre: z.string().trim().min(3, NOMBRE_MSG).max(100, NOMBRE_MSG),
  precio: z.number({ error: PRECIO_MSG }).gt(0, PRECIO_MSG),
  stock: z.number({ error: STOCK_MSG }).int(STOCK_MSG).min(0, STOCK_MSG),
  category_id: z
    .number({ error: CATEGORY_MSG })
    .int(CATEGORY_MSG)
    .positive(CATEGORY_MSG),
})

export type ProductCreate = z.infer<typeof productCreateSchema>
