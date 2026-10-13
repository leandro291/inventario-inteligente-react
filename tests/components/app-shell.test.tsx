import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('CA1: "Inicio" es el primer link y solo está activo en /', () => {
    const router = createMemoryRouter(
      [
        {
          element: <AppShell />,
          children: [
            { path: '/', element: <p>inicio</p> },
            { path: '/products', element: <p>lista</p> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)

    const nav = screen.getByRole('navigation', { name: 'Principal' })
    const links = within(nav).getAllByRole('link')
    expect(links[0]).toHaveAccessibleName('Inicio')
    expect(links[0]).toHaveAttribute('aria-current', 'page')
    expect(
      links.slice(1).filter((l) => l.hasAttribute('aria-current')),
    ).toEqual([])

    fireEvent.click(screen.getByRole('link', { name: 'Productos' }))
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
