import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatMoney } from '@/lib/format'
import { isLowStock } from '@/lib/stock'

export type ProductRow = {
  id: number
  nombre: string
  categoria: string
  precio: number
  stock: number
}

type ProductTableProps = {
  rows: ProductRow[]
  onDelete: (id: number) => void
}

const headClass = 'h-10 px-5 text-xs font-medium text-muted-foreground'
const cellClass = 'border-muted px-5 py-3'

export function ProductTable({ rows, onDelete }: ProductTableProps) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className={headClass}>ID</TableHead>
          <TableHead className={headClass}>Nombre</TableHead>
          <TableHead className={headClass}>Categoría</TableHead>
          <TableHead className={`${headClass} text-right`}>Precio</TableHead>
          <TableHead className={`${headClass} text-right`}>Stock</TableHead>
          <TableHead className={`${headClass} text-right`}>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="border-muted">
            <TableCell
              className={`${cellClass} font-mono text-muted-foreground`}
            >
              {row.id}
            </TableCell>
            <TableCell className={`${cellClass} font-medium`}>
              {row.nombre}
            </TableCell>
            <TableCell className={cellClass}>
              <Badge variant="secondary">{row.categoria}</Badge>
            </TableCell>
            <TableCell className={`${cellClass} text-right font-mono`}>
              {formatMoney(row.precio)}
            </TableCell>
            <TableCell className={`${cellClass} text-right`}>
              {isLowStock(row.stock) ? (
                <Badge className="bg-warning font-mono text-warning-foreground">
                  {row.stock.toLocaleString('es-AR')}
                </Badge>
              ) : (
                <span className="font-mono">
                  {row.stock.toLocaleString('es-AR')}
                </span>
              )}
            </TableCell>
            <TableCell className="border-muted px-3 py-1.5 text-right">
              <Button
                variant="ghost"
                size="icon"
                className="size-11 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Eliminar ${row.nombre}`}
                onClick={() => onDelete(row.id)}
              >
                <Trash2 aria-hidden />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
