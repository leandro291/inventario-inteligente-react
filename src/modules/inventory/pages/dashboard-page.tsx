import type { SubmitEvent } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/format'
import { LOW_STOCK_THRESHOLD } from '@/lib/stock'
import { CategoryStockChart } from '@/modules/inventory/components/category-stock-chart'
import { CategoryValueChart } from '@/modules/inventory/components/category-value-chart'
import { KpiCard } from '@/modules/inventory/components/kpi-card'
import { LowStockTable } from '@/modules/inventory/components/low-stock-table'
import { useDashboard } from '@/modules/inventory/hooks/use-dashboard'

const stateClass = 'py-8 text-center text-sm text-muted-foreground'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useDashboard()

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
  }

  function renderContent() {
    if (isPending)
      return (
        <p role="status" className={stateClass}>
          Cargando resumen…
        </p>
      )
    if (isError || !data)
      return (
        <p role="alert" className={stateClass}>
          No se pudo cargar el resumen.
        </p>
      )
    return (
      <>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <KpiCard
            label="Productos"
            value={data.productos.toLocaleString('es-AR')}
            footer={`en ${data.categorias} categorías`}
          />
          <KpiCard
            label="Unidades en stock"
            value={data.unidades.toLocaleString('es-AR')}
            footer="suma de stock"
          />
          <KpiCard
            label="Valor del inventario"
            value={formatMoney(data.valor)}
            footer="precio × stock"
          />
          <KpiCard
            isAlert
            label="Stock bajo"
            value={data.stockBajo.toLocaleString('es-AR')}
            footer={`productos con ≤ ${LOW_STOCK_THRESHOLD} u.`}
          />
        </div>
        {data.productos === 0 ? (
          <p className={stateClass}>Todavía no hay productos.</p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
              <CategoryStockChart items={data.porCategoria} />
              <CategoryValueChart items={data.porCategoria} />
            </div>
            <LowStockTable rows={data.reponer} />
          </>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Vista rápida
          </h1>
          <p className="text-xs text-muted-foreground">
            Resumen del inventario
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative min-w-64">
          <label htmlFor="dashboard-search" className="sr-only">
            Buscar producto
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="dashboard-search"
            name="q"
            type="search"
            placeholder="Buscar producto…"
            className="h-11 rounded-lg pl-9"
          />
        </form>
      </header>
      {renderContent()}
    </div>
  )
}
