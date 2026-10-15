import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/router'
import { getCategories } from '@/modules/inventory/services/categories.service'
import { getProducts } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/modules/inventory/services/products.service', () => ({
  getProducts: vi.fn(),
  deleteProduct: vi.fn(),
}))

const categories = [
  { id: 1, nombre: 'Bebidas' },
  { id: 2, nombre: 'Snacks' },
]
const products = [
  { id: 1, nombre: 'Agua mineral', precio: 850, stock: 240, category_id: 1 },
  { id: 2, nombre: 'Papas fritas', precio: 1400.5, stock: 10, category_id: 2 },
  { id: 3, nombre: 'Galletas', precio: 1200, stock: 5, category_id: 2 },
]

function setup(url = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

function kpi(label: string) {
  const card = screen.getByText(label, { selector: 'span' }).parentElement
  if (!card) throw new Error(`KPI ${label} no encontrado`)
  return card
}

function submitSearch(input: HTMLElement) {
  const form = input.closest('form')
  if (!form) throw new Error('form no encontrado')
  fireEvent.submit(form)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getCategories).mockResolvedValue(categories)
  vi.mocked(getProducts).mockResolvedValue(products)
})

describe('DashboardPage', () => {
  it('CA1: / muestra Inicio con el header y "Inicio" activo en la nav', async () => {
    setup('/')

    expect(
      await screen.findByRole('heading', { name: 'Vista rápida' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Resumen del inventario')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveAttribute(
      'aria-current',
    )
    // el chat vive en la nav del shell (fase 05), no en el header de Inicio
    expect(
      within(screen.getByRole('main')).queryByRole('button', {
        name: /chat ia/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('CA1: los demás links de la nav siguen funcionando', async () => {
    const router = setup('/')
    await screen.findByText('Productos', { selector: 'span' })

    fireEvent.click(screen.getByRole('link', { name: 'Productos' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products'),
    )
  })

  it('CA2: los 4 KPIs muestran los totales con su pie', async () => {
    setup()
    await screen.findByText('Valor del inventario')

    expect(kpi('Productos')).toHaveTextContent('3')
    expect(kpi('Productos')).toHaveTextContent('en 2 categorías')
    expect(kpi('Unidades en stock')).toHaveTextContent('255')
    expect(kpi('Unidades en stock')).toHaveTextContent('suma de stock')
    // 850*240 + 1400,5*10 + 1200*5
    expect(kpi('Valor del inventario')).toHaveTextContent('$224.005,00')
    expect(kpi('Valor del inventario')).toHaveTextContent('precio × stock')
    expect(kpi('Stock bajo')).toHaveTextContent('2')
    expect(kpi('Stock bajo')).toHaveTextContent('productos con ≤ 10 u.')
  })

  it('CA8: gráficos con role="img" y aria-label, y KPI de stock bajo como alerta', async () => {
    setup()
    await screen.findByText('Valor del inventario')

    const charts = screen.getAllByRole('img')
    expect(charts).toHaveLength(2)
    charts.forEach((chart) => expect(chart).toHaveAccessibleName())
    expect(screen.getByText('Reponer pronto')).toBeInTheDocument()
    expect(kpi('Stock bajo').closest('[data-slot="card"]')).toHaveClass(
      'bg-warning',
    )
    expect(kpi('Productos').closest('[data-slot="card"]')).not.toHaveClass(
      'bg-warning',
    )
  })

  it('CA8: el buscador mide al menos 44px (h-11)', async () => {
    setup()

    expect(
      await screen.findByRole('searchbox', { name: 'Buscar producto' }),
    ).toHaveClass('h-11')
  })

  it('CA6: enviar la búsqueda navega a /products?q= y filtra la tabla', async () => {
    const router = setup()
    const input = await screen.findByRole('searchbox', {
      name: 'Buscar producto',
    })

    fireEvent.change(input, { target: { value: '  papas ' } })
    submitSearch(input)

    expect(await screen.findByText('Papas fritas')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/products')
    expect(router.state.location.search).toBe('?q=papas')
    expect(screen.queryByText('Agua mineral')).not.toBeInTheDocument()
  })

  it('CA6: búsqueda vacía navega a /products sin q', async () => {
    const router = setup()
    const input = await screen.findByRole('searchbox', {
      name: 'Buscar producto',
    })

    fireEvent.change(input, { target: { value: '   ' } })
    submitSearch(input)

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products'),
    )
    expect(router.state.location.search).toBe('')
  })

  it('CA7: muestra el estado de carga', () => {
    vi.mocked(getProducts).mockReturnValue(new Promise(() => {}))
    setup()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando resumen…')
  })

  it.each([
    ['productos', () => vi.mocked(getProducts)],
    ['categorías', () => vi.mocked(getCategories)],
  ])('CA7: error si falla %s', async (_name, mock) => {
    mock().mockRejectedValue(new Error('boom'))
    setup()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar el resumen.',
    )
  })

  it('CA7: sin productos muestra el mensaje y no los gráficos ni la tabla', async () => {
    vi.mocked(getProducts).mockResolvedValue([])
    setup()

    expect(
      await screen.findByText('Todavía no hay productos.'),
    ).toBeInTheDocument()
    expect(kpi('Productos')).toHaveTextContent('0')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText('Reponer pronto')).not.toBeInTheDocument()
  })
})
