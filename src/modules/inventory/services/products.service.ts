import { api } from '@/lib/api'
import {
  productSchema,
  type Product,
} from '@/modules/inventory/schemas/product.schema'

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<unknown>('/products/')
  return productSchema.array().parse(data)
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}
