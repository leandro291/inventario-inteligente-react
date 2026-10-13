import { Card } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'

export type ProductPreviewProps = {
  nombre: string
  categoria: string | undefined
  precio: number
  stock: number
}

export function ProductPreview({
  nombre,
  categoria,
  precio,
  stock,
}: ProductPreviewProps) {
  const nombreVisible = nombre.trim() || 'Nombre del producto'
  const categoriaVisible = categoria?.trim() || 'Sin categoría'
  // NaN llega cuando el campo numérico está vacío: se toma como 0
  const valorStock =
    (Number.isFinite(precio) ? precio : 0) *
    (Number.isFinite(stock) ? stock : 0)

  return (
    <Card className="[--card-spacing:--spacing(5)] ring-border">
      <h2 className="text-base font-semibold">Vista previa</h2>
      <p className="text-base font-semibold">{nombreVisible}</p>
      <p className="text-xs text-muted-foreground">{categoriaVisible}</p>
      <div className="flex items-center justify-between border-t border-muted pt-3 text-sm">
        <span className="text-muted-foreground">Valor en stock</span>
        <span className="font-mono font-medium">{formatMoney(valorStock)}</span>
      </div>
    </Card>
  )
}
