import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { AppShell } from '@/components/app-shell'
import { ChatSheet } from '@/modules/assistant/components/chat-sheet'
import { CategoriesPage } from '@/modules/inventory/pages/categories-page'
import { NewProductPage } from '@/modules/inventory/pages/new-product-page'
import { ProductsPage } from '@/modules/inventory/pages/products-page'

export const routes: RouteObject[] = [
  {
    element: <AppShell navFooter={<ChatSheet />} />,
    children: [
      { path: '/', element: <Navigate to="/products" replace /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/products/new', element: <NewProductPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
