import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AxiosError, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatSheet } from '@/modules/assistant/components/chat-sheet'
import { ask } from '@/modules/assistant/services/assistant.service'

vi.mock('@/modules/assistant/services/assistant.service', async () => ({
  ...(await vi.importActual<
    typeof import('@/modules/assistant/services/assistant.service')
  >('@/modules/assistant/services/assistant.service')),
  ask: vi.fn(),
}))

const GREETING =
  'Hola, soy tu asistente. Puedo consultar productos, categorías y stock.'

function setup() {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <ChatSheet />
    </QueryClientProvider>,
  )
}

function open() {
  fireEvent.click(screen.getByRole('button', { name: 'Chat IA' }))
}

function type(text: string) {
  fireEvent.change(screen.getByLabelText('Mensaje'), {
    target: { value: text },
  })
}

function sendTyped(text: string) {
  type(text)
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
}

function httpError(status: number) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    status,
  } as AxiosResponse)
}

describe('ChatSheet', () => {
  beforeEach(() => vi.resetAllMocks())

  it('CA1: abre con título y saludo; cerrar y reabrir conserva los mensajes', async () => {
    vi.mocked(ask).mockResolvedValue({ respuesta: 'Hay 3 productos' })
    setup()
    expect(
      screen.queryByText('Asistente de inventario'),
    ).not.toBeInTheDocument()

    open()
    expect(screen.getByText('Asistente de inventario')).toBeInTheDocument()
    expect(screen.getByText(GREETING)).toBeInTheDocument()

    sendTyped('Cuántos productos hay')
    await screen.findByText('Hay 3 productos')

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar chat' }))
    await waitFor(() =>
      expect(
        screen.queryByText('Asistente de inventario'),
      ).not.toBeInTheDocument(),
    )

    open()
    expect(screen.getByText(GREETING)).toBeInTheDocument()
    expect(screen.getByText('Cuántos productos hay')).toBeInTheDocument()
    expect(screen.getByText('Hay 3 productos')).toBeInTheDocument()
  })

  it('CA2: usa el mismo thread_id y muestra usuario, "Pensando…" y respuesta', async () => {
    let resolve: (value: { respuesta: string }) => void = () => {}
    vi.mocked(ask)
      .mockImplementationOnce(() => new Promise((res) => (resolve = res)))
      .mockResolvedValueOnce({ respuesta: 'Segunda' })
    setup()
    open()

    sendTyped('  Primera pregunta  ')
    expect(screen.getByText('Primera pregunta')).toBeInTheDocument()
    expect(screen.getByText('Pensando…')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensaje')).toHaveValue('')

    await waitFor(() => expect(ask).toHaveBeenCalledTimes(1))
    resolve({ respuesta: 'Primera' })
    await screen.findByText('Primera')
    expect(screen.queryByText('Pensando…')).not.toBeInTheDocument()

    sendTyped('Segunda pregunta')
    await screen.findByText('Segunda')

    const [first, second] = vi.mocked(ask).mock.calls.map(([input]) => input)
    expect(first?.pregunta).toBe('Primera pregunta')
    expect(first?.thread_id).toBeTruthy()
    expect(second?.thread_id).toBe(first?.thread_id)
  })

  it('CA3: una sugerencia envía su texto', async () => {
    vi.mocked(ask).mockResolvedValue({ respuesta: 'ok' })
    setup()
    open()

    fireEvent.click(
      screen.getByRole('button', { name: 'Productos con stock bajo' }),
    )

    await screen.findByText('ok')
    expect(vi.mocked(ask).mock.calls[0]?.[0]).toMatchObject({
      pregunta: 'Productos con stock bajo',
    })
  })

  it.each([
    [502, 'Falló el agente, intentá de nuevo.'],
    [500, 'No se pudo contactar al asistente.'],
  ])(
    'CA5: error %i muestra alert y devuelve el texto al campo',
    async (status, message) => {
      vi.mocked(ask).mockRejectedValue(httpError(status))
      setup()
      open()

      sendTyped('Pregunta que falla')

      expect(await screen.findByRole('alert')).toHaveTextContent(message)
      expect(screen.queryByText('Pensando…')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Mensaje')).toHaveValue('Pregunta que falla')
    },
  )

  it('CA5: un error no HTTP usa el mensaje genérico', async () => {
    vi.mocked(ask).mockRejectedValue(new Error('boom'))
    setup()
    open()

    sendTyped('Otra pregunta')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo contactar al asistente.',
    )
  })

  it('CA5: enviar de nuevo limpia el aviso de error', async () => {
    vi.mocked(ask)
      .mockRejectedValueOnce(httpError(502))
      .mockResolvedValueOnce({ respuesta: 'ya anda' })
    setup()
    open()

    sendTyped('Reintento')
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    await screen.findByText('ya anda')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('CA6: muestra <b> como texto literal y respeta los saltos de línea', async () => {
    vi.mocked(ask).mockResolvedValue({ respuesta: '<b>Total</b>\nlínea 2' })
    setup()
    open()

    sendTyped('Dame el total')

    const bubble = await screen.findByText(/<b>Total<\/b>/)
    expect(bubble.textContent).toBe('<b>Total</b>\nlínea 2')
    expect(bubble.querySelector('b')).toBeNull()
    expect(bubble).toHaveClass('whitespace-pre-line')
  })

  it('CA7: la lista es un log con aria-live polite y el cierre es accesible', () => {
    setup()
    open()

    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByRole('button', { name: 'Cerrar chat' })).toHaveClass(
      'size-11',
    )
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument()
  })
})
