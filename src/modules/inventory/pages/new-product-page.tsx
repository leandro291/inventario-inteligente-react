import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { ProductForm } from '@/modules/inventory/components/product-form'
import { ProductPreview } from '@/modules/inventory/components/product-preview'
import { useCategories } from '@/modules/inventory/hooks/use-categories'
import { useCreateProduct } from '@/modules/inventory/hooks/use-create-product'
import {
  productCreateSchema,
  type ProductCreate,
} from '@/modules/inventory/schemas/product.schema'

export function NewProductPage() {
  const categories = useCategories()
  const createProduct = useCreateProduct()
  const form = useForm<ProductCreate>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: { nombre: '' },
  })

  const { nombre, precio, stock, category_id } = useWatch({
    control: form.control,
  })
  const categoryList = categories.data ?? []

  // el aviso de error se oculta al volver a editar (igual que el de éxito)
  const { isError, reset: resetCreate } = createProduct
  useEffect(() => {
    if (!isError) return undefined
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: () => resetCreate(),
    })
    return unsubscribe
  }, [isError, resetCreate, form])

  function handleSubmit(values: ProductCreate) {
    createProduct.mutate(values, { onSuccess: () => form.reset() })
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <header className="flex flex-col gap-1">
        <Link
          to="/products"
          className="inline-flex h-11 items-center self-start text-sm text-primary hover:underline"
        >
          ← Productos
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nuevo producto
        </h1>
      </header>

      <div className="flex flex-wrap items-start gap-4">
        <ProductForm
          form={form}
          categories={categoryList}
          isCategoriesPending={categories.isPending}
          isCategoriesError={categories.isError}
          isSaving={createProduct.isPending}
          isSaved={createProduct.isSuccess}
          hasSaveError={createProduct.isError}
          onSubmit={handleSubmit}
        />
        <div className="min-w-0 flex-[1_1_260px]">
          <ProductPreview
            nombre={nombre ?? ''}
            categoria={categoryList.find((c) => c.id === category_id)?.nombre}
            precio={precio ?? NaN}
            stock={stock ?? NaN}
          />
        </div>
      </div>
    </div>
  )
}
