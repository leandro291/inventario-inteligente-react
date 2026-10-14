import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatMoney } from '@/lib/format'

type CategoryValueChartProps = {
  items: { nombre: string; valor: number }[]
}

export function CategoryValueChart({ items }: CategoryValueChartProps) {
  const sorted = [...items].sort((a, b) => b.valor - a.valor)
  const max = sorted[0]?.valor ?? 0
  const summary = sorted
    .map((item) => `${item.nombre}: ${formatMoney(item.valor)}`)
    .join(', ')

  return (
    <Card className="[--card-spacing:--spacing(5)] ring-border">
      <CardHeader className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">Valor por categoría</h2>
        <span className="text-xs text-muted-foreground">$</span>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label={`Gráfico de barras horizontales: valor del inventario por categoría. ${summary}`}
          className="flex flex-col gap-4"
        >
          {sorted.map((item) => (
            <div key={item.nombre} className="flex flex-col gap-1.5">
              <div className="flex justify-between gap-3 text-sm">
                <span>{item.nombre}</span>
                <span className="font-mono">{formatMoney(item.valor)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  data-testid="value-bar"
                  className="h-full rounded-full bg-chart-2"
                  style={{
                    width: `${max > 0 ? Math.round((item.valor / max) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
