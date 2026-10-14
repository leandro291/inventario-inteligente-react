import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LowStockTable } from '@/modules/inventory/components/low-stock-table'

function renderTable(rows: Parameters<typeof LowStockTable>[0]['rows']) {
  render(
    <MemoryRouter>
      <LowStockTable rows={rows} />
    </MemoryRouter>,
  )
}

describe('LowStockTable', () => {
  it('muestra barras al stock / 10, con mínimo 4% y tope 100%, y "<n> u."', () => {
    renderTable([
      { id: 1, nombre: 'Lavandina', categoria: 'Limpieza', stock: 0 },
      { id: 2, nombre: 'Gaseosa', categoria: 'Bebidas', stock: 8 },
      { id: 3, nombre: 'Yogur', categoria: 'Lácteos', stock: 10 },
    ])
    const widths = screen
      .getAllByTestId('low-stock-bar')
      .map((bar) => (bar as HTMLElement).style.width)
    expect(widths).toEqual(['4%', '80%', '100%'])
    expect(screen.getByText('8 u.')).toBeTruthy()
    expect(screen.getByText('Limpieza')).toBeTruthy()
  })

  it('enlaza "Ver productos" a /products', () => {
    renderTable([])
    expect(
      screen.getByRole('link', { name: 'Ver productos' }).getAttribute('href'),
    ).toBe('/products')
  })

  it('vacío muestra el mensaje y no la tabla', () => {
    renderTable([])
    expect(screen.getByText('No hay productos con stock bajo.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })
})
