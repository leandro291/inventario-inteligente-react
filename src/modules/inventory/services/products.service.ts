import { api } from '@/lib/api'
import {
  productCreateSchema,
  productSchema,
  type Product,
  type ProductCreate,
} from '@/modules/inventory/schemas/product.schema'

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<unknown>('/products/')
  return productSchema.array().parse(data)
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/${id}`)
}

export async function createProduct(input: ProductCreate): Promise<Product> {
  // parse recorta el nombre y garantiza el body aunque el llamador no pase por el form
  const body = productCreateSchema.parse(input)
  const { data } = await api.post<unknown>('/products/', body)
  return productSchema.parse(data)
}
