# Pantallas del canvas — Inicio

Estado: implementada
Fase: 04 de 5

## Objetivo

Una vista rápida del inventario al entrar a la app: totales, stock y valor por categoría, y qué productos hay que reponer. Fuente visual: canvas https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr (`project/Main.dc.html`), con el look de `docs/DESIGN-SYSTEM.md`. Todo se calcula en el cliente desde `GET /products/` y `GET /categories/`.

## Alcance

- Incluye:
  - `/` muestra Inicio (reemplaza el redirect a `/products` de la fase 01).
  - Header: título "Vista rápida", subtítulo "Resumen del inventario", búsqueda "Buscar producto…" que al enviar navega a `/products?q=<texto>`.
  - 4 KPIs (`auto-fit minmax(200px,1fr)`):
    - "Productos": cantidad; pie "en <n> categorías".
    - "Unidades en stock": suma de stock (`toLocaleString('es-AR')`); pie "suma de stock".
    - "Valor del inventario": Σ precio × stock con `formatMoney`; pie "precio × stock".
    - "Stock bajo" (receta KPI de alerta): cantidad con `isLowStock`; pie "productos con ≤ 10 u." (usa `LOW_STOCK_THRESHOLD`).
  - "Stock por categoría": barras verticales (`bg-chart-1`), altura proporcional a las unidades (la mayor = 85% del alto), valor arriba y nombre abajo; leyenda "unidades".
  - "Valor por categoría": barras horizontales (`bg-chart-2` sobre `bg-muted`), ordenadas de mayor a menor valor, ancho proporcional (la mayor = 100%), etiqueta con `formatMoney`.
  - "Reponer pronto": tabla de productos con stock bajo ordenados por stock ascendente: Producto · Categoría · Stock (barra `bg-warning-strong` con ancho `stock / LOW_STOCK_THRESHOLD`, mínimo 4%, y "<n> u."); link "Ver productos" a `/products`.
  - Gráficos con `role="img"` y `aria-label` descriptivo; sin productos los gráficos no dividen por cero (barras en 0).
  - Estados: cargando, error ("No se pudo cargar el resumen."), sin productos ("Todavía no hay productos." en lugar de gráficos y tabla); "Reponer pronto" vacío: "No hay productos con stock bajo.".
  - Nav: link "Inicio" (icono `House`) primero, activo solo en `/` exacto.
- No incluye:
  - Botón "Chat IA" (fase 05).
  - Filtros por fecha, históricos o exportar.
  - `@tanstack/react-charts` (DESIGN-SYSTEM: `div` + CSS).

## Contratos de datos

Sin endpoints nuevos: `GET /products/` y `GET /categories/` (ya existen).

Resumen de Inicio (en `hooks/use-dashboard.ts`; no depende de la fase 03, que está en otro PR):

```ts
type CategoryTotals = {
  id: number
  nombre: string
  unidades: number
  valor: number
}
type LowStockRow = {
  id: number
  nombre: string
  categoria: string
  stock: number
}
type DashboardSummary = {
  productos: number
  categorias: number
  unidades: number
  valor: number
  stockBajo: number
  porCategoria: CategoryTotals[] // orden de GET /categories/; valor = Σ precio × stock
  reponer: LowStockRow[] // stock ascendente; categoría "Sin categoría" si no hay match
}
```

## UI

- `DashboardPage` compone: header con búsqueda, 4 `KpiCard`, `CategoryStockChart`, `CategoryValueChart`, `LowStockTable`; datos con `useDashboard`.
- `KpiCard`: presentacional (`label`, `value`, `footer`, `isAlert?`); receta KPI / KPI de alerta.
- `CategoryStockChart` / `CategoryValueChart`: presentacionales; reciben `{ nombre, unidades }[]` / `{ nombre, valor }[]`; calculan los porcentajes.
- `LowStockTable`: presentacional; recibe `LowStockRow[]`; tabla shadcn dentro de `overflow-x-auto`.
- Los dos gráficos lado a lado en desktop (`auto-fit minmax(340px,1fr)`), apilados en angosto.

## Reutilización

| Necesidad               | Se reutiliza / se crea                                                         | Fuente                                  |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------- |
| Productos y categorías  | Se reutiliza                                                                   | `useProducts`, `useCategories`          |
| Agregados por categoría | Se crean dentro de `summarizeInventory` (la fase 03 todavía no está en `main`) | `hooks/use-dashboard.ts`                |
| Stock bajo, dinero      | Se reutiliza                                                                   | `src/lib/stock.ts`, `src/lib/format.ts` |
| Card, Table, Input      | Se reutiliza                                                                   | `src/components/ui/`                    |
| Búsqueda → Productos    | Se reutiliza `?q=` de `ProductsPage`                                           | fase 01                                 |
| Resumen de Inicio       | Se crea `summarizeInventory` + `useDashboard`                                  | `src/modules/inventory/hooks/`          |
| KPI, gráficos, tabla    | Se crean componentes presentacionales                                          | `src/modules/inventory/components/`     |
| Nav                     | Se extiende `NAV_ITEMS`                                                        | `src/components/app-shell.tsx`          |

## Plan de tareas

Rutas relativas a `inventario-inteligente-react/`. No se instala nada.

| ID  | Ola | Tarea                                                                                                                                                                                                                                                | Archivos (exclusivos)                                                                                                                                                                                                             | Tests                                                                                                                                                                                                                            | Depende de |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| T1  | 1   | Datos: `summarizeInventory(categories, products): DashboardSummary` y `useDashboard()` (`{ data, isPending, isError }`: error si falla cualquiera de las dos queries; pending mientras alguna carga y ninguna falló; `data` solo con ambas cargadas) | `src/modules/inventory/hooks/use-dashboard.ts`                                                                                                                                                                                    | `tests/modules/inventory/use-dashboard.test.tsx`                                                                                                                                                                                 | —          |
| T2  | 1   | Componentes presentacionales                                                                                                                                                                                                                         | `src/modules/inventory/components/kpi-card.tsx`, `src/modules/inventory/components/category-stock-chart.tsx`, `src/modules/inventory/components/category-value-chart.tsx`, `src/modules/inventory/components/low-stock-table.tsx` | `tests/modules/inventory/category-charts.test.tsx`, `tests/modules/inventory/low-stock-table.test.tsx`                                                                                                                           | —          |
| T3  | 2   | Página e integración: `/` → `DashboardPage`, link "Inicio"                                                                                                                                                                                           | `src/modules/inventory/pages/dashboard-page.tsx`, `src/router.tsx`, `src/components/app-shell.tsx`                                                                                                                                | `tests/modules/inventory/dashboard-page.test.tsx`, `tests/components/app-shell.test.tsx`, `tests/modules/inventory/products-page.test.tsx` (el test de CA1 de la fase 01 que espera el redirect de `/` pasa a abrir `/products`) | T1, T2     |

T2 define sus props con tipos locales (no importa `DashboardSummary`) para que la ola 1 sea paralela. T3 va sola en la ola 2 (registro de rutas).

## Criterios de aceptación

- [ ] CA1 `/` muestra Inicio con el link "Inicio" primero en la nav y `aria-current="page"` solo en `/`; los demás links siguen funcionando (tests de `app-shell` y de la página).
- [ ] CA2 Con datos de ejemplo, los 4 KPIs muestran productos, "en <n> categorías", unidades, valor total con `formatMoney` y cantidad con stock ≤ 10 (test de `summarizeInventory` + test de la página).
- [ ] CA3 `porCategoria` trae unidades y valor correctos por categoría (0 y 0 si no tiene productos; un producto con categoría inexistente no se cuenta en ninguna) (test de `summarizeInventory`).
- [ ] CA4 "Stock por categoría": la categoría con más unidades tiene barra al 85% y las demás proporcionales; "Valor por categoría" ordena de mayor a menor con la mayor al 100%; con todo en 0 no hay `NaN` ni `Infinity` (tests de los gráficos).
- [ ] CA5 "Reponer pronto" lista solo productos con stock ≤ 10, de menor a mayor stock, con categoría resuelta ("Sin categoría" si no existe), barra al `stock / 10` (mínimo 4%) y "<n> u."; vacío → "No hay productos con stock bajo." (tests).
- [ ] CA6 Enviar la búsqueda del header navega a `/products?q=<texto>` y la tabla de Productos queda filtrada (test con la tabla de rutas real).
- [ ] CA7 Estados: cargando, error "No se pudo cargar el resumen." (si falla productos o categorías), y sin productos "Todavía no hay productos." (test).
- [ ] CA8 Gráficos con `role="img"` y `aria-label`; KPI de stock bajo con la receta de alerta; controles ≥ 44px (revisión de código + test por rol).
- [ ] CA9 Definition of Done: `npm run build`, `npm run lint`, `npx vitest run`, `npm run format:check` en verde.

## Preguntas abiertas

- Búsqueda vacía en el header — por defecto: navega a `/products` sin `q`.
- Agregado por categoría duplicado con `summarizeCategories` de la fase 03 (PR #3) — por defecto: se acepta en esta fase; cuando ambas estén en `main`, una tarea BUILD unifica en una sola función.
- Categorías sin productos en los gráficos — por defecto: aparecen con barra en 0 (todas las categorías, como el canvas).

## Fases siguientes

- 05 — Chat IA (módulo `assistant`): `Sheet` lateral desde un botón "Chat IA" en el header de cada pantalla; `POST /ai/preguntar` `{pregunta: 3–500, thread_id}` → `{respuesta}`; `502` → "Falló el agente, intenta de nuevo".
