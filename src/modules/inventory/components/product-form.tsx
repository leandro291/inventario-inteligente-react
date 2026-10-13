import type { ReactNode } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '@/modules/inventory/schemas/category.schema'
import type { ProductCreate } from '@/modules/inventory/schemas/product.schema'

export type ProductFormProps = {
  form: UseFormReturn<ProductCreate>
  categories: Category[]
  isCategoriesPending: boolean
  isCategoriesError: boolean
  isSaving: boolean
  isSaved: boolean
  hasSaveError: boolean
  onSubmit: (values: ProductCreate) => void
}

type FieldProps = {
  id: keyof ProductCreate
  label: string
  error: string | undefined
  children: ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-secondary-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function ProductForm({
  form,
  categories,
  isCategoriesPending,
  isCategoriesError,
  isSaving,
  isSaved,
  hasSaveError,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form

  // aria-invalid + aria-describedby por campo con error
  const a11y = (id: keyof ProductCreate) => ({
    id,
    'aria-invalid': errors[id] ? true : undefined,
    'aria-describedby': errors[id] ? `${id}-error` : undefined,
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-w-0 flex-[999_1_420px] flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-border"
    >
      <Field id="nombre" label="Nombre" error={errors.nombre?.message}>
        <Input
          {...a11y('nombre')}
          {...register('nombre')}
          type="text"
          placeholder="Ej.: Café molido 250 g"
          className="h-11 rounded-lg"
        />
      </Field>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <Field id="precio" label="Precio ($)" error={errors.precio?.message}>
          <Input
            {...a11y('precio')}
            {...register('precio', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0,00"
            className="h-11 rounded-lg font-mono"
          />
        </Field>
        <Field
          id="stock"
          label="Stock (unidades)"
          error={errors.stock?.message}
        >
          <Input
            {...a11y('stock')}
            {...register('stock', { valueAsNumber: true })}
            type="number"
            step="1"
            placeholder="0"
            className="h-11 rounded-lg font-mono"
          />
        </Field>
      </div>
      <Field
        id="category_id"
        label="Categoría"
        error={
          isCategoriesError
            ? 'No se pudieron cargar las categorías.'
            : errors.category_id?.message
        }
      >
        <Controller
          control={control}
          name="category_id"
          render={({ field }) => (
            <Select
              disabled={isCategoriesPending}
              value={field.value ? String(field.value) : ''}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger
                {...a11y('category_id')}
                className="w-full rounded-lg data-[size=default]:h-11"
              >
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      {/* siempre en el DOM: solo cambia el texto (se limpia al volver a editar) */}
      <p
        role="status"
        className={
          isSaved && !isDirty
            ? 'rounded-lg bg-success px-3.5 py-3 text-sm text-success-foreground'
            : 'sr-only'
        }
      >
        {isSaved && !isDirty ? 'Producto guardado.' : ''}
      </p>
      {hasSaveError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          No se pudo guardar el producto.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 pt-1">
        <Button asChild variant="outline" className="h-11 px-4">
          <Link to="/products">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          variant="ink"
          className="h-11 px-5"
          disabled={isSaving || isCategoriesError}
        >
          Guardar producto
        </Button>
      </div>
    </form>
  )
}
