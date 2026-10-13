import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: string
  footer: string
  isAlert?: boolean
}

export function KpiCard({ label, value, footer, isAlert }: KpiCardProps) {
  return (
    <Card
      className={cn(
        '[--card-spacing:--spacing(5)] ring-border',
        isAlert && 'bg-warning text-warning-foreground ring-warning-border',
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <span className={cn('text-xs', !isAlert && 'text-muted-foreground')}>
          {label}
        </span>
        <span className="font-mono text-3xl font-medium">{value}</span>
        <span className={cn('text-xs', !isAlert && 'text-muted-foreground')}>
          {footer}
        </span>
      </CardContent>
    </Card>
  )
}
