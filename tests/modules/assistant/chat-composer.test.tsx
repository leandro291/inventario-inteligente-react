import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatComposer } from '@/modules/assistant/components/chat-composer'

function setup(value = '', isPending = false) {
  const onSend = vi.fn()
  render(
    <ChatComposer
      value={value}
      onChange={vi.fn()}
      onSend={onSend}
      isPending={isPending}
    />,
  )
  return { onSend }
}

const send = () => screen.getByRole('button', { name: 'Enviar' })

describe('ChatComposer', () => {
  it('CA3: un chip envía su texto', () => {
    const { onSend } = setup()
    fireEvent.click(
      screen.getByRole('button', { name: 'Productos con stock bajo' }),
    )
    expect(onSend).toHaveBeenCalledWith('Productos con stock bajo')
  })

  it('CA4: deshabilita Enviar con menos de 3 caracteres recortados', () => {
    setup('ab')
    expect(send()).toBeDisabled()
  })

  it('CA4: deshabilita Enviar con solo espacios', () => {
    setup('     ')
    expect(send()).toBeDisabled()
  })

  it('CA4: deshabilita Enviar y chips con una pregunta en curso', () => {
    setup('texto válido', true)
    expect(send()).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Valor total del inventario' }),
    ).toBeDisabled()
  })

  it('CA4: el campo limita a 500 caracteres y tiene Label asociado', () => {
    setup()
    expect(screen.getByLabelText('Mensaje')).toHaveAttribute('maxlength', '500')
  })

  it('CA4: submit con texto válido llama onSend', () => {
    const { onSend } = setup('¿Cuánto stock hay?')
    expect(send()).toBeEnabled()
    fireEvent.click(send())
    expect(onSend).toHaveBeenCalledWith('¿Cuánto stock hay?')
  })
})
