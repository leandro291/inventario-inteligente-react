import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DeleteProductDialog } from '@/modules/inventory/components/delete-product-dialog'
import {
  ProductTable,
  type ProductRow,
} from '@/modules/inventory/components/product-table'
import { useCategories } from '@/modules/inventory/hooks/use-categories'
import { useDeleteProduct } from '@/modules/inventory/hooks/use-delete-product'
import { useProducts } from '@/modules/inventory/hooks/use-products'

// Radix Select no admite value="" en un item
const ALL_CATEGORIES = 'all'
const stateClass = 'py-8 text-center text-sm text-muted-foreground'

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ALL_CATEGORIES

  const products = useProducts()
  const categories = useCategories()
  const deleteProduct = useDeleteProduct()
  const [productToDelete, setProductToDelete] = useState<{
    id: number
    nombre: string
  } | null>(null)

  function setParam(key: 'q' | 'category', value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  function handleConfirmDelete() {
    if (!productToDelete) return
    deleteProduct.mutate(productToDelete.id, {
      onSettled: () => setProductToDelete(null),
    })
  }

  const categoryNames = new Map(
    (categories.data ?? []).map((c) => [c.id, c.nombre]),
  )
  const allProducts = products.data ?? []
  const rows: ProductRow[] = allProducts
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(q.toLowerCase()) &&
        (category === ALL_CATEGORIES || p.category_id === Number(category)),
    )
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categoria: categoryNames.get(p.category_id) ?? 'Sin categoría',
      precio: p.precio,
      stock: p.stock,
    }))

  function renderContent() {
    if (products.isPending || categories.isPending)
      return (
        <p role="status" className={stateClass}>
          Cargando productos…
        </p>
      )
    if (products.isError || categories.isError)
      return (
        <p role="alert" className={stateClass}>
          No se pudieron cargar los productos.
        </p>
      )
    if (allProducts.length === 0)
      return <p className={stateClass}>Todavía no hay productos.</p>
    if (rows.length === 0)
      return (
        <p className={stateClass}>Ningún producto coincide con la búsqueda.</p>
      )
    return (
      <ProductTable
        rows={rows}
        onDelete={(id) => {
          const product = allProducts.find((p) => p.id === id)
          if (product) setProductToDelete({ id, nombre: product.nombre })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">
          {allProducts.length} productos
        </p>
      </header>

      <section className="rounded-xl bg-card ring-1 ring-border">
        <div className="flex flex-wrap items-center gap-3 border-b p-5">
          <div className="relative min-w-64 flex-1">
            <label htmlFor="product-search" className="sr-only">
              Buscar producto
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="product-search"
              type="search"
              placeholder="Buscar por nombre…"
              className="h-11 rounded-lg pl-9"
              value={q}
              onChange={(event) => setParam('q', event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label htmlFor="category-filter">Categoría</label>
            <Select
              value={category}
              onValueChange={(value) =>
                setParam('category', value === ALL_CATEGORIES ? '' : value)
              }
            >
              <SelectTrigger
                id="category-filter"
                className="rounded-lg text-foreground data-[size=default]:h-11"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>Todas</SelectItem>
                {(categories.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {renderContent()}
      </section>

      <DeleteProductDialog
        open={productToDelete !== null}
        productName={productToDelete?.nombre ?? ''}
        isPending={deleteProduct.isPending}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
      />
    </div>
  )
}
