import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Home } from '@/routes/home'

test('renderiza el título', () => {
  render(<Home />)
  expect(
    screen.getByRole('button', { name: 'Inventario Inteligente' }),
  ).toBeInTheDocument()
})
