import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppShell } from '@/components/app-shell'
import { NewProductPage } from '@/modules/inventory/pages/new-product-page'
import { ProductsPage } from '@/modules/inventory/pages/products-page'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/products" replace /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <NewProductPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
