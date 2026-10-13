import { Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'

export type CategoryCardProps = {
  id: number
  nombre: string
  productos: number
  unidades: number
}

export function CategoryCard({
  id,
  nombre,
  productos,
  unidades,
}: CategoryCardProps) {
  return (
    <Card className="[--card-spacing:--spacing(5)] ring-border">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground">#{id}</span>
          <h2 className="text-base font-semibold">{nombre}</h2>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Productos</dt>
            <dd className="font-mono text-2xl font-medium">
              {productos.toLocaleString('es-AR')}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Unidades</dt>
            <dd className="font-mono text-2xl font-medium">
              {unidades.toLocaleString('es-AR')}
            </dd>
          </div>
        </dl>
        <Link
          to={`/products?category=${id}`}
          className="inline-flex h-11 items-center self-start text-sm text-primary hover:underline"
        >
          Ver productos
        </Link>
      </CardContent>
    </Card>
  )
}
