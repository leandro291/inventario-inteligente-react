import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppShell } from '@/components/app-shell'
import { DashboardPage } from '@/modules/inventory/pages/dashboard-page'
import { NewProductPage } from '@/modules/inventory/pages/new-product-page'
import { ProductsPage } from '@/modules/inventory/pages/products-page'

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <NewProductPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
