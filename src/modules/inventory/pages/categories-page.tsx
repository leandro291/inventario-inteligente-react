import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CategoryCard } from '@/modules/inventory/components/category-card'
import { CategoryForm } from '@/modules/inventory/components/category-form'
import { useCategorySummaries } from '@/modules/inventory/hooks/use-category-summaries'
import { useCreateCategory } from '@/modules/inventory/hooks/use-create-category'
import {
  categoryCreateSchema,
  type CategoryCreate,
} from '@/modules/inventory/schemas/category.schema'

const stateClass = 'py-8 text-center text-sm text-muted-foreground'

export function CategoriesPage() {
  const summaries = useCategorySummaries()
  const createCategory = useCreateCategory()
  const form = useForm<CategoryCreate>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { nombre: '' },
  })

  // el aviso de error se oculta al volver a editar (igual que el de éxito)
  const { isError, reset: resetCreate } = createCategory
  useEffect(() => {
    if (!isError) return undefined
    return form.subscribe({
      formState: { values: true },
      callback: () => resetCreate(),
    })
  }, [isError, resetCreate, form])

  function handleSubmit(values: CategoryCreate) {
    createCategory.mutate(values, { onSuccess: () => form.reset() })
  }

  function renderContent() {
    if (summaries.isPending)
      return (
        <p role="status" className={stateClass}>
          Cargando categorías…
        </p>
      )
    if (summaries.isError || !summaries.data)
      return (
        <p role="alert" className={stateClass}>
          No se pudieron cargar las categorías.
        </p>
      )
    if (summaries.data.length === 0)
      return <p className={stateClass}>Todavía no hay categorías.</p>
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {summaries.data.map((summary) => (
          <CategoryCard key={summary.id} {...summary} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
        <p className="text-sm text-muted-foreground">
          {summaries.data ? `${summaries.data.length} categorías` : ' '}
        </p>
      </header>

      <CategoryForm
        form={form}
        isSaving={createCategory.isPending}
        isSaved={createCategory.isSuccess}
        hasSaveError={createCategory.isError}
        onSubmit={handleSubmit}
      />

      {renderContent()}
    </div>
  )
}
