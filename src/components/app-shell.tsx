import { Boxes } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [{ to: '/products', label: 'Productos', icon: Boxes }]

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-wrap content-start min-[784px]:content-stretch bg-background text-foreground">
      <nav
        aria-label="Principal"
        className="flex flex-[1_1_224px] flex-col gap-1 bg-sidebar p-3 text-sidebar-foreground"
      >
        <div className="flex h-11 items-center gap-2 px-3 text-base font-semibold">
          <Boxes aria-hidden className="size-5" />
          Inventario
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-2 rounded-md px-3 text-sm',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/60',
              )
            }
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="min-w-0 flex-[999_1_560px]">
        <Outlet />
      </main>
    </div>
  )
}
