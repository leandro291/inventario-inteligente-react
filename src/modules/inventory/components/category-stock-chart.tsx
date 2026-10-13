import { Card, CardContent, CardHeader } from '@/components/ui/card'

type CategoryStockChartProps = {
  items: { nombre: string; unidades: number }[]
}

const MAX_BAR_HEIGHT = 85

export function CategoryStockChart({ items }: CategoryStockChartProps) {
  const max = Math.max(0, ...items.map((item) => item.unidades))
  const summary = items
    .map((item) => `${item.nombre}: ${item.unidades.toLocaleString('es-AR')}`)
    .join(', ')

  return (
    <Card className="[--card-spacing:--spacing(5)] ring-border">
      <CardHeader className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">Stock por categoría</h2>
        <span className="text-xs text-muted-foreground">unidades</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          role="img"
          aria-label={`Gráfico de barras: unidades en stock por categoría. ${summary}`}
          className="flex h-60 gap-3 border-b border-border"
        >
          {items.map((item) => (
            <div
              key={item.nombre}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="font-mono text-xs">
                {item.unidades.toLocaleString('es-AR')}
              </span>
              <div
                data-testid="stock-bar"
                className="w-full max-w-13 rounded-t-md bg-chart-1"
                style={{
                  height: `${max > 0 ? Math.round((item.unidades / max) * MAX_BAR_HEIGHT) : 0}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {items.map((item) => (
            <span
              key={item.nombre}
              className="min-w-0 flex-1 truncate text-center text-xs text-muted-foreground"
            >
              {item.nombre}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
