import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateProduct } from '@/modules/inventory/hooks/use-create-product'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { createProduct } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/products.service', () => ({
  createProduct: vi.fn(),
}))

const input = { nombre: 'Mouse', precio: 2.5, stock: 5, category_id: 1 }

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidate, ...renderHook(() => useCreateProduct(), { wrapper }) }
}

describe('useCreateProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama al servicio con los datos e invalida el listado al guardar', async () => {
    vi.mocked(createProduct).mockResolvedValue({ id: 9, ...input })
    const { result, invalidate } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(invalidate).toHaveBeenCalled())
    expect(vi.mocked(createProduct).mock.calls[0]?.[0]).toEqual(input)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.products(),
    })
  })

  it('no invalida el listado si el POST falla', async () => {
    vi.mocked(createProduct).mockRejectedValue(new Error('500'))
    const { result, invalidate } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})
