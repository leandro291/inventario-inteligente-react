import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  ChatMessages,
  type ChatMessage,
} from '@/modules/assistant/components/chat-messages'

function renderMessages(messages: ChatMessage[], isPending = false) {
  return render(<ChatMessages messages={messages} isPending={isPending} />)
}

function assistant(text: string): ChatMessage {
  return { id: 'a1', author: 'assistant', text }
}

describe('ChatMessages', () => {
  it('renderiza listas con viñeta', () => {
    renderMessages([assistant('- uno\n- dos')])

    const list = screen.getByRole('list')
    expect(list).toHaveClass('list-disc')
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('renderiza negrita', () => {
    renderMessages([assistant('Total: **12 productos**')])

    expect(screen.getByText('12 productos').tagName).toBe('STRONG')
  })

  it('renderiza tablas GFM dentro de overflow-x-auto', () => {
    renderMessages([
      assistant('| Nombre | Stock |\n| --- | --- |\n| Mate | 5 |'),
    ])

    const table = screen.getByRole('table')
    expect(table.parentElement).toHaveClass('overflow-x-auto')
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toHaveClass(
      'border',
    )
    expect(screen.getByRole('cell', { name: 'Mate' })).toHaveClass('border')
  })

  it('renderiza links que abren en otra pestaña', () => {
    renderMessages([assistant('[Docs](https://example.com)')])

    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link).toHaveClass('text-primary', 'underline')
  })

  it('no interpreta markdown en mensajes del usuario', () => {
    renderMessages([{ id: 'u1', author: 'user', text: '**hola**\nmundo' }])

    const bubble = screen.getByText(/\*\*hola\*\*/)
    expect(bubble.textContent).toBe('**hola**\nmundo')
    expect(bubble).toHaveClass('whitespace-pre-line')
    expect(bubble.querySelector('strong')).toBeNull()
  })

  it('no crea elementos b ni script desde HTML crudo', () => {
    const { container } = renderMessages([
      assistant('<b>x</b> <script>alert(1)</script>'),
    ])

    expect(container.querySelector('b')).toBeNull()
    expect(container.querySelector('script')).toBeNull()
    expect(container).toHaveTextContent('<b>x</b>')
  })

  it('descarta hrefs javascript:', () => {
    renderMessages([assistant('[click](javascript:alert(1))')])

    const link = screen.queryByRole('link', { name: 'click' })
    expect(link?.getAttribute('href') ?? '').not.toMatch(/javascript:/i)
  })

  it('mantiene role log, aria-live y "Pensando…"', () => {
    renderMessages([], true)

    expect(screen.getByRole('log')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Pensando…')).toBeInTheDocument()
  })
})
