import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  summarizeCategories,
  useCategorySummaries,
} from '@/modules/inventory/hooks/use-category-summaries'
import { getCategories } from '@/modules/inventory/services/categories.service'
import { getProducts } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/modules/inventory/services/products.service', () => ({
  getProducts: vi.fn(),
}))

const categories = [
  { id: 2, nombre: 'Bebidas' },
  { id: 1, nombre: 'Snacks' },
  { id: 3, nombre: 'Vacía' },
]
const products = [
  { id: 1, nombre: 'Agua', precio: 10, stock: 5, category_id: 2 },
  { id: 2, nombre: 'Jugo', precio: 20, stock: 7, category_id: 2 },
  { id: 3, nombre: 'Papas', precio: 30, stock: 4, category_id: 1 },
  { id: 4, nombre: 'Huérfano', precio: 40, stock: 99, category_id: 42 },
]

describe('summarizeCategories', () => {
  it('cuenta productos y suma unidades por categoría, en el orden de categories', () => {
    expect(summarizeCategories(categories, products)).toEqual([
      { id: 2, nombre: 'Bebidas', productos: 2, unidades: 12 },
      { id: 1, nombre: 'Snacks', productos: 1, unidades: 4 },
      { id: 3, nombre: 'Vacía', productos: 0, unidades: 0 },
    ])
  })

  it('no cuenta productos de una categoría inexistente', () => {
    const result = summarizeCategories(categories, products)
    expect(result.reduce((acc, c) => acc + c.unidades, 0)).toBe(16)
  })

  it('sin categorías devuelve lista vacía', () => {
    expect(summarizeCategories([], products)).toEqual([])
  })
})

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useCategorySummaries(), { wrapper })
}

describe('useCategorySummaries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('expone los agregados cuando ambas queries cargaron', async () => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getProducts).mockResolvedValue(products)
    const { result } = setup()

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data).toEqual(
      summarizeCategories(categories, products),
    )
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('está pendiente mientras alguna query carga', async () => {
    vi.mocked(getCategories).mockResolvedValue(categories)
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}))
    const { result } = setup()

    await waitFor(() => expect(getCategories).toHaveBeenCalled())
    expect(result.current.isPending).toBe(true)
    expect(result.current.isError).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('isError si falla categorías', async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error('500'))
    vi.mocked(getProducts).mockResolvedValue(products)
    const { result } = setup()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('isError si falla productos, aunque categorías siga cargando', async () => {
    vi.mocked(getCategories).mockReturnValue(new Promise(() => {}))
    vi.mocked(getProducts).mockRejectedValue(new Error('500'))
    const { result } = setup()

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isPending).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
