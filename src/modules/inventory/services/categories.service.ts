import { api } from '@/lib/api'
import {
  categoryCreateSchema,
  categorySchema,
  type Category,
  type CategoryCreate,
} from '@/modules/inventory/schemas/category.schema'

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<unknown>('/categories/')
  return categorySchema.array().parse(data)
}

export async function createCategory(input: CategoryCreate): Promise<Category> {
  // parse recorta el nombre y garantiza el body aunque el llamador no pase por el form
  const body = categoryCreateSchema.parse(input)
  const { data } = await api.post<unknown>('/categories/', body)
  return categorySchema.parse(data)
}
