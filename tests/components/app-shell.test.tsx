import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppShell } from '@/components/app-shell'

describe('AppShell', () => {
  it('marca Productos como activo en /products y renderiza el outlet', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AppShell />,
          children: [{ path: '/products', element: <p>contenido</p> }],
        },
      ],
      { initialEntries: ['/products'] },
    )
    render(<RouterProvider router={router} />)

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(nav).toHaveTextContent('Inventario')
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('main')).toHaveTextContent('contenido')
  })

  it('CA1: en /products/new solo "Nuevo producto" queda activo', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AppShell />,
          children: [
            { path: '/products', element: <p>lista</p> },
            { path: '/products/new', element: <p>alta</p> },
          ],
        },
      ],
      { initialEntries: ['/products/new'] },
    )
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole('link', { name: 'Nuevo producto' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('CA1: en /categories "Categorías" queda activo, entre Productos y Nuevo producto', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AppShell />,
          children: [{ path: '/categories', element: <p>categorias</p> }],
        },
      ],
      { initialEntries: ['/categories'] },
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveAttribute(
      'aria-current',
    )
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Productos', 'Categorías', 'Nuevo producto'])
  })

  it('renderiza navFooter dentro de la nav', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AppShell navFooter={<button>Pie</button>} />,
          children: [{ path: '/products', element: <p>lista</p> }],
        },
      ],
      { initialEntries: ['/products'] },
    )
    render(<RouterProvider router={router} />)

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(within(nav).getByRole('button', { name: 'Pie' })).toBeInTheDocument()
  })
})
