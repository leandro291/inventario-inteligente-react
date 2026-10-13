import { useMemo } from 'react'
import { useCategories } from '@/modules/inventory/hooks/use-categories'
import { useProducts } from '@/modules/inventory/hooks/use-products'
import type { Category } from '@/modules/inventory/schemas/category.schema'
import type { Product } from '@/modules/inventory/schemas/product.schema'

export type CategorySummary = {
  id: number
  nombre: string
  productos: number
  unidades: number
}

export function summarizeCategories(
  categories: Category[],
  products: Product[],
): CategorySummary[] {
  const totals = new Map<number, { productos: number; unidades: number }>()
  for (const { category_id, stock } of products) {
    const total = totals.get(category_id) ?? { productos: 0, unidades: 0 }
    totals.set(category_id, {
      productos: total.productos + 1,
      unidades: total.unidades + stock,
    })
  }
  return categories.map(({ id, nombre }) => ({
    id,
    nombre,
    productos: totals.get(id)?.productos ?? 0,
    unidades: totals.get(id)?.unidades ?? 0,
  }))
}

export function useCategorySummaries() {
  const categories = useCategories()
  const products = useProducts()

  const isError = categories.isError || products.isError
  const isPending = !isError && (categories.isPending || products.isPending)
  const data = useMemo(
    () =>
      categories.data && products.data
        ? summarizeCategories(categories.data, products.data)
        : undefined,
    [categories.data, products.data],
  )

  return { data: isError ? undefined : data, isPending, isError }
}
