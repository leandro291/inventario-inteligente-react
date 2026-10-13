import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CategoryStockChart } from '@/modules/inventory/components/category-stock-chart'
import { CategoryValueChart } from '@/modules/inventory/components/category-value-chart'

describe('CategoryStockChart', () => {
  it('pone la mayor al 85% y las demás proporcionales', () => {
    render(
      <CategoryStockChart
        items={[
          { nombre: 'Bebidas', unidades: 200 },
          { nombre: 'Snacks', unidades: 100 },
        ]}
      />,
    )
    const heights = screen
      .getAllByTestId('stock-bar')
      .map((bar) => (bar as HTMLElement).style.height)
    expect(heights).toEqual(['85%', '43%'])
    expect(screen.getByRole('img', { name: /unidades en stock/ })).toBeTruthy()
    expect(screen.getByText('Stock por categoría')).toBeTruthy()
  })

  it('con todo en 0 no genera NaN ni Infinity', () => {
    render(
      <CategoryStockChart
        items={[
          { nombre: 'Bebidas', unidades: 0 },
          { nombre: 'Snacks', unidades: 0 },
        ]}
      />,
    )
    const heights = screen
      .getAllByTestId('stock-bar')
      .map((bar) => (bar as HTMLElement).style.height)
    expect(heights).toEqual(['0%', '0%'])
  })
})

describe('CategoryValueChart', () => {
  it('ordena de mayor a menor con la mayor al 100% y etiqueta en pesos', () => {
    render(
      <CategoryValueChart
        items={[
          { nombre: 'Snacks', valor: 50 },
          { nombre: 'Bebidas', valor: 200 },
        ]}
      />,
    )
    const bars = screen.getAllByTestId('value-bar') as HTMLElement[]
    expect(bars.map((bar) => bar.style.width)).toEqual(['100%', '25%'])
    const chart = screen.getByRole('img', { name: /valor del inventario/ })
    expect(chart.textContent?.indexOf('Bebidas')).toBeLessThan(
      chart.textContent?.indexOf('Snacks') ?? -1,
    )
    expect(screen.getByText('$200,00')).toBeTruthy()
    expect(screen.getByText('Valor por categoría')).toBeTruthy()
  })

  it('con todo en 0 no genera NaN ni Infinity', () => {
    render(
      <CategoryValueChart
        items={[
          { nombre: 'Bebidas', valor: 0 },
          { nombre: 'Snacks', valor: 0 },
        ]}
      />,
    )
    const bars = screen.getAllByTestId('value-bar') as HTMLElement[]
    expect(bars.map((bar) => bar.style.width)).toEqual(['0%', '0%'])
  })
})
