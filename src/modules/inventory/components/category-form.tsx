import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryCreate } from '@/modules/inventory/schemas/category.schema'

export type CategoryFormProps = {
  form: UseFormReturn<CategoryCreate>
  isSaving: boolean
  isSaved: boolean
  hasSaveError: boolean
  onSubmit: (values: CategoryCreate) => void
}

export function CategoryForm({
  form,
  isSaving,
  isSaved,
  hasSaveError,
  onSubmit,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = form
  const error = errors.nombre?.message
  const isConfirmed = isSaved && !isDirty

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-xl bg-card p-6 ring-1 ring-border"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre" className="text-secondary-foreground">
          Nueva categoría
        </Label>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex min-w-60 flex-1 flex-col gap-1.5">
            <Input
              id="nombre"
              type="text"
              placeholder="Ej.: Congelados"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'nombre-error' : undefined}
              className="h-11 rounded-lg"
              {...register('nombre')}
            />
            {error && (
              <p id="nombre-error" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="ink"
            className="h-11 px-5"
            disabled={isSaving}
          >
            Agregar
          </Button>
        </div>
      </div>
      {/* siempre en el DOM: solo cambia el texto (se limpia al volver a editar) */}
      <p
        role="status"
        className={
          isConfirmed
            ? 'rounded-lg bg-success px-3.5 py-3 text-sm text-success-foreground'
            : 'sr-only'
        }
      >
        {isConfirmed ? 'Categoría agregada.' : ''}
      </p>
      {hasSaveError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          No se pudo agregar la categoría.
        </p>
      )}
    </form>
  )
}
