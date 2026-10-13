import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  summarizeInventory,
  useDashboard,
} from '@/modules/inventory/hooks/use-dashboard'
import type { Category } from '@/modules/inventory/schemas/category.schema'
import type { Product } from '@/modules/inventory/schemas/product.schema'
import { getCategories } from '@/modules/inventory/services/categories.service'
import { getProducts } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/modules/inventory/services/products.service', () => ({
  getProducts: vi.fn(),
}))

const categories: Category[] = [
  { id: 1, nombre: 'Bebidas' },
  { id: 2, nombre: 'Snacks' },
  { id: 3, nombre: 'Vacía' },
]
const products: Product[] = [
  { id: 1, nombre: 'Agua', precio: 100, stock: 50, category_id: 1 },
  { id: 2, nombre: 'Jugo', precio: 200, stock: 5, category_id: 1 },
  { id: 3, nombre: 'Papas', precio: 300, stock: 10, category_id: 2 },
  { id: 4, nombre: 'Huérfano', precio: 10, stock: 2, category_id: 99 },
  { id: 5, nombre: 'Maní', precio: 50, stock: 11, category_id: 2 },
]

describe('summarizeInventory', () => {
  const summary = summarizeInventory(categories, products)

  it('CA2: totales globales (incluye huérfanos)', () => {
    expect(summary.productos).toBe(5)
    expect(summary.categorias).toBe(3)
    expect(summary.unidades).toBe(78)
    expect(summary.valor).toBe(5000 + 1000 + 3000 + 20 + 550)
    expect(summary.stockBajo).toBe(3)
  })

  it('CA3: unidades y valor por categoría, 0 y 0 sin productos, huérfanos fuera', () => {
    expect(summary.porCategoria).toEqual([
      { id: 1, nombre: 'Bebidas', unidades: 55, valor: 6000 },
      { id: 2, nombre: 'Snacks', unidades: 21, valor: 3550 },
      { id: 3, nombre: 'Vacía', unidades: 0, valor: 0 },
    ])
  })

  it('CA5: reponer solo stock ≤ 10, ascendente, con categoría o "Sin categoría"', () => {
    expect(summary.reponer).toEqual([
      { id: 4, nombre: 'Huérfano', categoria: 'Sin categoría', stock: 2 },
      { id: 2, nombre: 'Jugo', categoria: 'Bebidas', stock: 5 },
      { id: 3, nombre: 'Papas', categoria: 'Snacks', stock: 10 },
    ])
  })

  it('sin datos devuelve todo en 0 y listas vacías', () => {
    expect(summarizeInventory([], [])).toEqual({
      productos: 0,
      categorias: 0,
      unidades: 0,
      valor: 0,
      stockBajo: 0,
      porCategoria: [],
      reponer: [],
    })
  })
})

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useDashboard(), { wrapper })
}

describe('useDashboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve el resumen cuando ambas queries cargan', async () => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getProducts).mockResolvedValue(products)
    const { result } = setup()

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data).toEqual(
      summarizeInventory(categories, products),
    )
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('está pendiente mientras alguna carga, sin data', async () => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}))
    const { result } = setup()

    await waitFor(() => expect(getCategories).toHaveBeenCalled())
    expect(result.current.isPending).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it.each([
    [
      'productos',
      () => vi.mocked(getProducts).mockRejectedValue(new Error('500')),
    ],
    [
      'categorías',
      () => vi.mocked(getCategories).mockRejectedValue(new Error('500')),
    ],
  ])('error si fallan %s', async (_name, fail) => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getProducts).mockResolvedValue(products)
    fail()
    const { result } = setup()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('error aunque la otra query siga cargando', async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error('500'))
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}))
    const { result } = setup()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
  })
})
