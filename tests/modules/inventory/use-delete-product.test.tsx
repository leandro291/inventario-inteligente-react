import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteProduct } from '@/modules/inventory/hooks/use-delete-product'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { deleteProduct } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/products.service', () => ({
  deleteProduct: vi.fn(),
}))

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidate, ...renderHook(() => useDeleteProduct(), { wrapper }) }
}

describe('useDeleteProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama al servicio con el id e invalida el listado', async () => {
    vi.mocked(deleteProduct).mockResolvedValue()
    const { result, invalidate } = setup()

    result.current.mutate(3)

    await waitFor(() => expect(invalidate).toHaveBeenCalled())
    expect(vi.mocked(deleteProduct).mock.calls[0]?.[0]).toBe(3)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.products(),
    })
  })

  it('invalida el listado también si el DELETE falla', async () => {
    vi.mocked(deleteProduct).mockRejectedValue(new Error('404'))
    const { result, invalidate } = setup()

    result.current.mutate(3)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.products(),
    })
  })
})
