import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAsk } from '@/modules/assistant/hooks/use-ask'
import { ask } from '@/modules/assistant/services/assistant.service'

vi.mock('@/modules/assistant/services/assistant.service', async () => ({
  ...(await vi.importActual<
    typeof import('@/modules/assistant/services/assistant.service')
  >('@/modules/assistant/services/assistant.service')),
  ask: vi.fn(),
}))

const input = { pregunta: 'Hola', thread_id: 't1' }

function setup() {
  const queryClient = new QueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return renderHook(() => useAsk(), { wrapper })
}

describe('useAsk', () => {
  beforeEach(() => vi.clearAllMocks())

  it('llama al servicio con la pregunta y expone la respuesta', async () => {
    vi.mocked(ask).mockResolvedValue({ respuesta: 'Hola!' })
    const { result } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(ask).mock.calls[0]?.[0]).toEqual(input)
    expect(result.current.data).toEqual({ respuesta: 'Hola!' })
  })

  it('expone el error si el servicio falla', async () => {
    const error = new Error('502')
    vi.mocked(ask).mockRejectedValue(error)
    const { result } = setup()

    result.current.mutate(input)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
  })

  it('errorMessage traduce el error del servicio y es null en éxito', async () => {
    vi.mocked(ask)
      .mockRejectedValueOnce(
        Object.assign(new AxiosError('fail'), { response: { status: 502 } }),
      )
      .mockResolvedValueOnce({ respuesta: 'ok' })
    const { result } = setup()
    expect(result.current.errorMessage).toBeNull()

    result.current.mutate(input)
    await waitFor(() =>
      expect(result.current.errorMessage).toBe(
        'Falló el agente, intentá de nuevo.',
      ),
    )

    result.current.mutate(input)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.errorMessage).toBeNull()
  })
})
