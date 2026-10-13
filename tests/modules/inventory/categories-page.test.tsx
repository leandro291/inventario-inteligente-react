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
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import {
  createCategory,
  getCategories,
} from '@/modules/inventory/services/categories.service'
import { getProducts } from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
}))
vi.mock('@/modules/inventory/services/products.service', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

const categories = [
  { id: 1, nombre: 'Bebidas' },
  { id: 2, nombre: 'Snacks' },
  { id: 3, nombre: 'Congelados' },
]
const products = [
  { id: 1, nombre: 'Agua mineral', precio: 850, stock: 240, category_id: 1 },
  { id: 2, nombre: 'Papas fritas', precio: 1400.5, stock: 10, category_id: 2 },
  { id: 3, nombre: 'Galletas', precio: 1200, stock: 11, category_id: 2 },
  { id: 4, nombre: 'Huérfano', precio: 100, stock: 50, category_id: 99 },
]

function setup(url = '/categories') {
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, invalidate }
}

function cardOf(name: string) {
  const card = screen
    .getByRole('heading', { name })
    .closest<HTMLElement>('[data-slot="card"]')
  if (!card) throw new Error(`sin card ${name}`)
  return card
}

const type = (value: string) =>
  fireEvent.change(screen.getByLabelText('Nueva categoría'), {
    target: { value },
  })
const add = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getCategories).mockResolvedValue(categories)
  vi.mocked(getProducts).mockResolvedValue(products)
})

describe('CategoriesPage', () => {
  it('CA1: en /categories solo "Categorías" del nav es el link activo', async () => {
    setup()

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(
      within(nav).getByRole('link', { name: 'Categorías' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(nav).getByRole('link', { name: 'Productos' }),
    ).not.toHaveAttribute('aria-current')
    expect(
      screen.getByRole('heading', { name: 'Categorías', level: 1 }),
    ).toBeInTheDocument()
    await screen.findByText('Bebidas')
  })

  it('CA1: el link "Categorías" del nav abre /categories', async () => {
    const { router } = setup('/products')

    fireEvent.click(screen.getByRole('link', { name: 'Categorías' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/categories'),
    )
    await screen.findByText('Bebidas')
  })

  it('CA2: cada card muestra #id, nombre, productos y unidades; sin productos 0 y 0; el huérfano no cuenta', async () => {
    setup()
    await screen.findByText('Bebidas')

    const bebidas = cardOf('Bebidas')
    expect(bebidas).toHaveTextContent('#1')
    expect(
      within(bebidas).getByText('Productos').nextSibling,
    ).toHaveTextContent('1')
    expect(within(bebidas).getByText('Unidades').nextSibling).toHaveTextContent(
      '240',
    )

    const snacks = cardOf('Snacks')
    expect(snacks).toHaveTextContent('#2')
    expect(within(snacks).getByText('Productos').nextSibling).toHaveTextContent(
      '2',
    )
    expect(within(snacks).getByText('Unidades').nextSibling).toHaveTextContent(
      '21',
    )

    const congelados = cardOf('Congelados')
    expect(congelados).toHaveTextContent('#3')
    expect(
      within(congelados).getByText('Productos').nextSibling,
    ).toHaveTextContent('0')
    expect(
      within(congelados).getByText('Unidades').nextSibling,
    ).toHaveTextContent('0')

    // el producto de la categoría 99 no suma en ninguna card (240 + 21 + 0)
    expect(screen.getAllByText('Productos', { selector: 'dt' })).toHaveLength(3)
  })

  it('CA3: "Ver productos" navega a /products?category=<id> y filtra la tabla', async () => {
    const { router } = setup()
    await screen.findByText('Snacks')

    fireEvent.click(
      within(cardOf('Snacks')).getByRole('link', { name: 'Ver productos' }),
    )

    await waitFor(() =>
      expect(router.state.location.search).toBe('?category=2'),
    )
    expect(router.state.location.pathname).toBe('/products')
    await screen.findByText('Papas fritas')
    expect(screen.getByText('Galletas')).toBeInTheDocument()
    expect(screen.queryByText('Agua mineral')).toBeNull()
    expect(screen.queryByText('Huérfano')).toBeNull()
  })

  it('CA4: nombre de 2 caracteres o solo espacios muestra el error y no llama al servicio', async () => {
    setup()
    await screen.findByText('Bebidas')

    type('ab')
    add()
    expect(await screen.findByText('Entre 3 y 100 caracteres.')).toBeVisible()
    expect(screen.getByLabelText('Nueva categoría')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Nueva categoría')).toHaveAttribute(
      'aria-describedby',
      'nombre-error',
    )

    type('     ')
    add()
    await waitFor(() =>
      expect(screen.getByText('Entre 3 y 100 caracteres.')).toBeVisible(),
    )
    expect(createCategory).not.toHaveBeenCalled()
  })

  it('CA5: guarda el nombre recortado, vacía el input, avisa en el status e invalida categorías', async () => {
    vi.mocked(createCategory).mockResolvedValue({ id: 4, nombre: 'Lácteos' })
    const { invalidate } = setup()
    await screen.findByText('Bebidas')
    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()

    type('  Lácteos  ')
    add()

    await waitFor(() => expect(status).toHaveTextContent('Categoría agregada.'))
    expect(vi.mocked(createCategory).mock.calls[0]?.[0]).toEqual({
      nombre: 'Lácteos',
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.categories(),
    })
    expect(screen.getByLabelText('Nueva categoría')).toHaveValue('')

    // volver a editar limpia el aviso
    type('Otra')
    await waitFor(() => expect(status).toBeEmptyDOMElement())
  })

  it('CA6: si el POST falla avisa, conserva lo escrito y oculta el aviso al editar', async () => {
    vi.mocked(createCategory).mockRejectedValue(new Error('500'))
    setup()
    await screen.findByText('Bebidas')

    type('Lácteos')
    add()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo agregar la categoría.',
    )
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByLabelText('Nueva categoría')).toHaveValue('Lácteos')

    type('Lácteos 2')
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  it('CA7: cargando, sin subtítulo con conteo', () => {
    vi.mocked(getCategories).mockReturnValue(new Promise(() => {}))
    setup()

    expect(screen.getByText('Cargando categorías…')).toBeVisible()
    expect(screen.queryByText(/\d+ categorías/)).toBeNull()
  })

  it('CA7: carga exitosa muestra "<n> categorías"', async () => {
    setup()

    expect(await screen.findByText('3 categorías')).toBeVisible()
  })

  it.each([
    ['categorías', () => vi.mocked(getCategories)],
    ['productos', () => vi.mocked(getProducts)],
  ])('CA7: si fallan %s muestra el error y no el conteo', async (_n, mock) => {
    mock().mockRejectedValue(new Error('network'))
    setup()

    expect(
      await screen.findByText('No se pudieron cargar las categorías.'),
    ).toBeVisible()
    expect(screen.queryByText(/\d+ categorías/)).toBeNull()
  })

  it('CA7: sin categorías muestra el estado vacío', async () => {
    vi.mocked(getCategories).mockResolvedValue([])
    setup()

    expect(await screen.findByText('Todavía no hay categorías.')).toBeVisible()
    expect(screen.getByText('0 categorías')).toBeVisible()
  })

  it('CA8: input con Label, y controles de alto >= 44px', async () => {
    setup()
    await screen.findByText('Bebidas')

    expect(screen.getByLabelText('Nueva categoría')).toHaveClass('h-11')
    expect(screen.getByRole('button', { name: 'Agregar' })).toHaveClass('h-11')
    const links = screen.getAllByRole('link', { name: 'Ver productos' })
    expect(links).toHaveLength(3)
    for (const link of links) {
      expect(link).toHaveClass('h-11', 'text-primary')
      expect(link).toHaveAttribute('href', expect.stringMatching(/category=/))
    }
  })
})
