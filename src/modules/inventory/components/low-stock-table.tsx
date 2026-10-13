import { Link } from 'react-router'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LOW_STOCK_THRESHOLD } from '@/lib/stock'

type LowStockTableProps = {
  rows: { id: number; nombre: string; categoria: string; stock: number }[]
}

const MIN_BAR_PERCENT = 4
const headClass = 'h-10 px-3 text-xs font-medium text-muted-foreground'
const cellClass = 'border-muted px-3 py-3'

function barPercent(stock: number): number {
  const percent = Math.round((stock / LOW_STOCK_THRESHOLD) * 100)
  return Math.min(100, Math.max(MIN_BAR_PERCENT, percent))
}

export function LowStockTable({ rows }: LowStockTableProps) {
  return (
    <Card className="[--card-spacing:--spacing(5)] ring-border">
      <CardHeader className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Reponer pronto</h2>
        <Link
          to="/products"
          className="inline-flex h-11 items-center text-sm text-primary hover:underline"
        >
          Ver productos
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay productos con stock bajo.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className={headClass}>Producto</TableHead>
                  <TableHead className={headClass}>Categoría</TableHead>
                  <TableHead className={`${headClass} w-2/5`}>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="border-muted">
                    <TableCell className={cellClass}>{row.nombre}</TableCell>
                    <TableCell className={`${cellClass} text-muted-foreground`}>
                      {row.categoria}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            data-testid="low-stock-bar"
                            className="h-full bg-warning-strong"
                            style={{ width: `${barPercent(row.stock)}%` }}
                          />
                        </div>
                        <span className="min-w-10 text-right font-mono text-xs text-warning-foreground">
                          {row.stock.toLocaleString('es-AR')} u.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
