import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/router'
import { getCategories } from '@/modules/inventory/services/categories.service'
import {
  deleteProduct,
  getProducts,
} from '@/modules/inventory/services/products.service'

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
  { id: 3, nombre: 'Galletas', precio: 1200, stock: 11, category_id: 2 },
  { id: 4, nombre: 'Huérfano', precio: 100, stock: 50, category_id: 99 },
]

function setup(url = '/products') {
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

beforeAll(() => {
  // jsdom no implementa lo que Radix Select necesita
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getCategories).mockResolvedValue(categories)
  vi.mocked(getProducts).mockResolvedValue(products)
})

describe('ProductsPage', () => {
  it('CA1: / redirige a /products dentro del shell con Productos activo', async () => {
    const router = setup('/')

    expect(await screen.findByText('Agua mineral')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/products')
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('CA2: resuelve la categoría y usa "Sin categoría" si no hay match', async () => {
    setup()

    const row = (await screen.findByText('Agua mineral')).closest('tr')
    expect(row).toHaveTextContent('Bebidas')
    expect(row).toHaveTextContent('$850,00')
    expect(screen.getByText('Huérfano').closest('tr')).toHaveTextContent(
      'Sin categoría',
    )
    expect(screen.getByText('4 productos')).toBeInTheDocument()
  })

  it('CA3: la búsqueda filtra sin distinguir mayúsculas y actualiza ?q=', async () => {
    const router = setup()
    await screen.findByText('Agua mineral')

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Buscar producto' }),
      {
        target: { value: 'PAPAS' },
      },
    )

    expect(screen.queryByText('Agua mineral')).not.toBeInTheDocument()
    expect(screen.getByText('Papas fritas')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=PAPAS')
  })

  it('CA3: elegir una categoría filtra y actualiza ?category=', async () => {
    const router = setup()
    await screen.findByText('Agua mineral')

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Categoría' }), {
      key: 'Enter',
    })
    fireEvent.click(await screen.findByRole('option', { name: 'Snacks' }))

    await waitFor(() =>
      expect(screen.queryByText('Agua mineral')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Papas fritas')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?category=2')
  })

  it('CA3: abrir la URL con ?q= y ?category= aplica el filtro', async () => {
    setup('/products?q=gall&category=2')

    expect(await screen.findByText('Galletas')).toBeInTheDocument()
    expect(screen.queryByText('Papas fritas')).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('gall')
    expect(
      screen.getByRole('combobox', { name: 'Categoría' }),
    ).toHaveTextContent('Snacks')
  })

  it.each([
    ['?category=abc', 'no numérico'],
    ['?category=99', 'id inexistente'],
  ])('CA3: %s (%s) se trata como "Todas"', async (search) => {
    setup(`/products${search}`)

    expect(await screen.findByText('Agua mineral')).toBeInTheDocument()
    expect(screen.getByText('Papas fritas')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Categoría' }),
    ).toHaveTextContent('Todas')
  })

  it('CA4: badge de stock bajo en 10, no en 11', async () => {
    setup()

    const low = (await screen.findByText('10')).closest('[data-slot=badge]')
    expect(low).toHaveClass('bg-warning', 'text-warning-foreground')
    expect(screen.getByText('11').closest('[data-slot=badge]')).toBeNull()
  })

  describe('CA6: eliminar', () => {
    it('muestra el nombre y confirmar llama al servicio con el id', async () => {
      vi.mocked(deleteProduct).mockResolvedValue()
      setup()

      fireEvent.click(
        await screen.findByRole('button', { name: 'Eliminar Papas fritas' }),
      )
      const dialog = await screen.findByRole('alertdialog')
      expect(dialog).toHaveTextContent('Papas fritas')

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
      )
      expect(vi.mocked(deleteProduct).mock.calls[0]?.[0]).toBe(2)
    })

    it('cancelar no llama al servicio', async () => {
      setup()

      fireEvent.click(
        await screen.findByRole('button', { name: 'Eliminar Papas fritas' }),
      )
      await screen.findByRole('alertdialog')
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
      )
      expect(deleteProduct).not.toHaveBeenCalled()
    })
  })

  describe('CA7: estados', () => {
    it('cargando', () => {
      vi.mocked(getProducts).mockReturnValue(new Promise(() => {}))
      setup()

      expect(screen.getByRole('status')).toHaveTextContent(
        'Cargando productos…',
      )
      expect(screen.queryByText(/\d+ productos/)).not.toBeInTheDocument()
    })

    it('error', async () => {
      vi.mocked(getProducts).mockRejectedValue(new Error('network'))
      setup()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se pudieron cargar los productos.',
      )
      expect(screen.queryByText(/\d+ productos/)).not.toBeInTheDocument()
    })

    it('sin productos', async () => {
      vi.mocked(getProducts).mockResolvedValue([])
      setup()

      expect(
        await screen.findByText('Todavía no hay productos.'),
      ).toBeInTheDocument()
    })

    it('sin resultados', async () => {
      setup('/products?q=zzz')

      expect(
        await screen.findByText('Ningún producto coincide con la búsqueda.'),
      ).toBeInTheDocument()
    })
  })
})
