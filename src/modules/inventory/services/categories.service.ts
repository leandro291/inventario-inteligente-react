import { api } from '@/lib/api'
import {
  categorySchema,
  type Category,
} from '@/modules/inventory/schemas/category.schema'

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<unknown>('/categories/')
  return categorySchema.array().parse(data)
}
