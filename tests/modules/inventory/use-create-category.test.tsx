import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateCategory } from '@/modules/inventory/hooks/use-create-category'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { createCategory } from '@/modules/inventory/services/categories.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  createCategory: vi.fn(),
}))

const input = { nombre: 'Bebidas' }

function setup() {
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidate, ...renderHook(() => useCreateCategory(), { wrapper }) }
}

describe('useCreateCategory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama al servicio con el nombre e invalida las categorías al guardar', async () => {
    vi.mocked(createCategory).mockResolvedValue({ id: 9, ...input })
    const { result, invalidate } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(invalidate).toHaveBeenCalled())
    expect(vi.mocked(createCategory).mock.calls[0]?.[0]).toEqual(input)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.categories(),
    })
  })

  it('no invalida las categorías si el POST falla', async () => {
    vi.mocked(createCategory).mockRejectedValue(new Error('500'))
    const { result, invalidate } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})
