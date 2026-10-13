import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppShell } from '@/components/app-shell'
import { ProductsPage } from '@/modules/inventory/pages/products-page'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/products" replace /> },
      { path: '/products', element: <ProductsPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
