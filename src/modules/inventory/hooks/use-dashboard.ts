import { useMemo } from 'react'
import { isLowStock } from '@/lib/stock'
import { useCategories } from '@/modules/inventory/hooks/use-categories'
import { useProducts } from '@/modules/inventory/hooks/use-products'
import type { Category } from '@/modules/inventory/schemas/category.schema'
import type { Product } from '@/modules/inventory/schemas/product.schema'

export type CategoryTotals = {
  id: number
  nombre: string
  unidades: number
  valor: number
}

export type LowStockRow = {
  id: number
  nombre: string
  categoria: string
  stock: number
}

export type DashboardSummary = {
  productos: number
  categorias: number
  unidades: number
  valor: number
  stockBajo: number
  porCategoria: CategoryTotals[]
  reponer: LowStockRow[]
}

const NO_CATEGORY = 'Sin categoría'

export function summarizeInventory(
  categories: Category[],
  products: Product[],
): DashboardSummary {
  const names = new Map(categories.map((c) => [c.id, c.nombre]))
  const lowStock = products
    .filter((p) => isLowStock(p.stock))
    .sort((a, b) => a.stock - b.stock)

  return {
    productos: products.length,
    categorias: categories.length,
    unidades: products.reduce((sum, p) => sum + p.stock, 0),
    valor: products.reduce((sum, p) => sum + p.precio * p.stock, 0),
    stockBajo: lowStock.length,
    porCategoria: categories.map(({ id, nombre }) => {
      const own = products.filter((p) => p.category_id === id)
      return {
        id,
        nombre,
        unidades: own.reduce((sum, p) => sum + p.stock, 0),
        valor: own.reduce((sum, p) => sum + p.precio * p.stock, 0),
      }
    }),
    reponer: lowStock.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: names.get(p.category_id) ?? NO_CATEGORY,
      stock: p.stock,
    })),
  }
}

export function useDashboard() {
  const categories = useCategories()
  const products = useProducts()

  const isError = categories.isError || products.isError
  const categoriesData = categories.data
  const productsData = products.data

  const data = useMemo(
    () =>
      categoriesData && productsData
        ? summarizeInventory(categoriesData, productsData)
        : undefined,
    [categoriesData, productsData],
  )

  return { data, isPending: !isError && !data, isError }
}
