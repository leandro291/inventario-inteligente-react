import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import {
  ask,
  getAskErrorMessage,
} from '@/modules/assistant/services/assistant.service'

vi.mock('@/lib/api', () => ({ api: { post: vi.fn() } }))

function httpError(status: number) {
  return Object.assign(new AxiosError('fail'), { response: { status } })
}

describe('assistant.service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ask hace POST /ai/preguntar con la pregunta recortada y devuelve la respuesta', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { respuesta: 'Hay 3.' } })

    await expect(
      ask({ pregunta: '  ¿Cuántos hay?  ', thread_id: 't1' }),
    ).resolves.toEqual({ respuesta: 'Hay 3.' })
    expect(api.post).toHaveBeenCalledWith('/ai/preguntar', {
      pregunta: '¿Cuántos hay?',
      thread_id: 't1',
    })
  })

  it('ask rechaza si la respuesta no tiene respuesta string (CA6)', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { respuesta: 42 } })

    await expect(ask({ pregunta: 'Hola', thread_id: 't1' })).rejects.toThrow()
  })

  it('ask rechaza sin llamar al back si el input es inválido', async () => {
    await expect(ask({ pregunta: 'ab', thread_id: 't1' })).rejects.toThrow()
    expect(api.post).not.toHaveBeenCalled()
  })
})

describe('getAskErrorMessage', () => {
  it('502 → falló el agente', () => {
    expect(getAskErrorMessage(httpError(502))).toBe(
      'Falló el agente, intentá de nuevo.',
    )
  })

  it.each([
    ['500', httpError(500)],
    ['error de red (sin response)', new AxiosError('Network Error')],
    ['error no-axios', new Error('boom')],
    ['valor no-error', 'boom'],
  ])('%s → no se pudo contactar', (_name, error) => {
    expect(getAskErrorMessage(error)).toBe('No se pudo contactar al asistente.')
  })
})
