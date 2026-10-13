import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { routes } from '@/router'
import { inventoryKeys } from '@/modules/inventory/inventory.keys'
import { getCategories } from '@/modules/inventory/services/categories.service'
import {
  createProduct,
  getProducts,
} from '@/modules/inventory/services/products.service'

vi.mock('@/modules/inventory/services/categories.service', () => ({
  getCategories: vi.fn(),
}))
vi.mock('@/modules/inventory/services/products.service', () => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))

const categories = [
  { id: 1, nombre: 'Bebidas' },
  { id: 2, nombre: 'Snacks' },
]

function setup(url = '/products/new') {
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

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

async function pickCategory(name: string) {
  const trigger = screen.getByRole('combobox', { name: 'Categoría' })
  await waitFor(() => expect(trigger).toBeEnabled())
  fireEvent.keyDown(trigger, { key: 'Enter' })
  fireEvent.click(await screen.findByRole('option', { name }))
}

async function fillValid() {
  type('Nombre', '  Mouse  ')
  type('Precio ($)', '2.5')
  type('Stock (unidades)', '5')
  await pickCategory('Snacks')
}

const save = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

beforeAll(() => {
  // jsdom no implementa lo que Radix Select necesita
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getCategories).mockResolvedValue(categories)
  vi.mocked(getProducts).mockResolvedValue([])
})

describe('NewProductPage', () => {
  it('CA1: en /products/new solo "Nuevo producto" del nav es el link activo', async () => {
    setup()

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(
      within(nav).getByRole('link', { name: 'Nuevo producto' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(nav).getByRole('link', { name: 'Productos' }),
    ).not.toHaveAttribute('aria-current')
    expect(
      screen.getByRole('heading', { name: 'Nuevo producto' }),
    ).toBeInTheDocument()
    await screen.findByRole('combobox', { name: 'Categoría' })
  })

  it('CA1: el link "← Productos" y Cancelar vuelven a /products', async () => {
    const { router } = setup()

    fireEvent.click(screen.getByRole('link', { name: '← Productos' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products'),
    )
    await screen.findByText('Todavía no hay productos.')

    fireEvent.click(
      within(screen.getByRole('main')).getByRole('link', {
        name: 'Nuevo producto',
      }),
    )
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products/new'),
    )
    fireEvent.click(screen.getByRole('link', { name: 'Cancelar' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products'),
    )
    await screen.findByText('Todavía no hay productos.')
  })

  it('CA2: datos inválidos muestran el mensaje de cada regla y no llaman al servicio', async () => {
    setup()
    await screen.findByRole('combobox', { name: 'Categoría' })

    type('Nombre', 'ab')
    type('Precio ($)', '0')
    type('Stock (unidades)', '1.5')
    save()

    expect(await screen.findByText('Entre 3 y 100 caracteres.')).toBeVisible()
    expect(screen.getByText('Tiene que ser mayor a 0.')).toBeVisible()
    expect(screen.getByText('Tiene que ser un entero ≥ 0.')).toBeVisible()
    expect(screen.getByText('Elegí una categoría.')).toBeVisible()
    expect(screen.getByLabelText('Nombre')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Nombre')).toHaveAttribute(
      'aria-describedby',
      'nombre-error',
    )
    expect(createProduct).not.toHaveBeenCalled()
  })

  it('CA2: campos vacíos fallan con el mensaje de su regla', async () => {
    setup()
    await screen.findByRole('combobox', { name: 'Categoría' })

    save()

    expect(await screen.findByText('Entre 3 y 100 caracteres.')).toBeVisible()
    expect(screen.getByText('Tiene que ser mayor a 0.')).toBeVisible()
    expect(screen.getByText('Tiene que ser un entero ≥ 0.')).toBeVisible()
    expect(screen.getByText('Elegí una categoría.')).toBeVisible()
    expect(createProduct).not.toHaveBeenCalled()
  })

  it('CA3 + CA4: guarda con números, avisa, vacía el form e invalida el listado', async () => {
    vi.mocked(createProduct).mockResolvedValue({
      id: 9,
      nombre: 'Mouse',
      precio: 2.5,
      stock: 5,
      category_id: 2,
    })
    const { invalidate } = setup()
    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()

    await fillValid()
    save()

    await waitFor(() => expect(status).toHaveTextContent('Producto guardado.'))
    expect(vi.mocked(createProduct).mock.calls[0]?.[0]).toEqual({
      nombre: 'Mouse',
      precio: 2.5,
      stock: 5,
      category_id: 2,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: inventoryKeys.products(),
    })
    expect(screen.getByLabelText('Nombre')).toHaveValue('')
    expect(screen.getByLabelText('Precio ($)')).toHaveValue(null)
    expect(screen.getByLabelText('Stock (unidades)')).toHaveValue(null)
    expect(
      screen.getByRole('combobox', { name: 'Categoría' }),
    ).toHaveTextContent('Elegí una categoría')

    // volver a editar limpia el aviso
    type('Nombre', 'Otro')
    await waitFor(() => expect(status).toBeEmptyDOMElement())
  })

  it('CA5: si el POST falla avisa y conserva lo escrito', async () => {
    vi.mocked(createProduct).mockRejectedValue(new Error('500'))
    setup()

    await fillValid()
    save()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo guardar el producto.',
    )
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByLabelText('Nombre')).toHaveValue('  Mouse  ')
    expect(screen.getByLabelText('Precio ($)')).toHaveValue(2.5)
    expect(screen.getByLabelText('Stock (unidades)')).toHaveValue(5)
    expect(
      screen.getByRole('combobox', { name: 'Categoría' }),
    ).toHaveTextContent('Snacks')
  })

  it('CA6: la vista previa tiene placeholders y refleja lo escrito', async () => {
    setup()
    const preview = screen.getByRole('heading', { name: 'Vista previa' })
      .parentElement as HTMLElement

    expect(preview).toHaveTextContent('Nombre del producto')
    expect(preview).toHaveTextContent('Sin categoría')
    expect(preview).toHaveTextContent('$0,00')

    type('Nombre', 'Mouse')
    type('Precio ($)', '2.5')
    type('Stock (unidades)', '5')
    await pickCategory('Snacks')

    await waitFor(() => expect(preview).toHaveTextContent('Snacks'))
    expect(preview).toHaveTextContent('Mouse')
    expect(preview).toHaveTextContent('$12,50')
  })

  it('CA7: con categorías cargando el select está deshabilitado', () => {
    vi.mocked(getCategories).mockReturnValue(new Promise(() => {}))
    setup()

    expect(screen.getByRole('combobox', { name: 'Categoría' })).toBeDisabled()
  })

  it('CA7: si las categorías fallan avisa y no se puede guardar', async () => {
    vi.mocked(getCategories).mockRejectedValue(new Error('network'))
    setup()

    expect(
      await screen.findByText('No se pudieron cargar las categorías.'),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Guardar producto' }),
    ).toBeDisabled()
  })

  it('CA9: cada control tiene su Label asociado', async () => {
    setup()

    for (const label of ['Nombre', 'Precio ($)', 'Stock (unidades)'])
      expect(screen.getByLabelText(label)).toHaveClass('h-11')
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveClass(
      'data-[size=default]:h-11',
    )
    expect(
      screen.getByRole('button', { name: 'Guardar producto' }),
    ).toHaveClass('h-11')
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveClass('h-11')
    await screen.findByRole('combobox', { name: 'Categoría' })
  })
})
