# Design System

Cómo construir UI fiel al canvas "Inventario Inteligente" (https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr). Los valores viven en `src/index.css`; este documento explica cómo usarlos. Solo hay tema claro.

## Colores

Usar siempre las utilidades de Tailwind generadas por los tokens, nunca hex sueltos (`bg-[#2f5bea]`).

| Utilidad                                 | Uso                                              |
| ---------------------------------------- | ------------------------------------------------ |
| `bg-background`                          | fondo de página                                  |
| `text-foreground`                        | texto principal                                  |
| `bg-card`                                | cards, tablas, forms                             |
| `bg-primary` / `text-primary-foreground` | marca, acción principal (Chat IA)                |
| `text-primary`                           | links                                            |
| `bg-secondary` / `bg-muted`              | badge de categoría, pista de barras              |
| `text-secondary-foreground`              | labels de form, texto de badge                   |
| `text-muted-foreground`                  | subtítulos, headers de tabla, pies               |
| `bg-accent` / `text-accent-foreground`   | hover suave, chips de sugerencia del chat        |
| `border-border`                          | bordes de cards y tablas (default de `border`)   |
| `border-input`                           | bordes de controles                              |
| `text-destructive`                       | eliminar                                         |
| `bg-sidebar*` / `text-sidebar*`          | nav lateral                                      |
| `bg-warning` / `text-warning-foreground` | stock bajo (KPI, badge)                          |
| `ring-warning-border`                    | borde (ring) del KPI de stock bajo               |
| `bg-warning-strong`                      | barra de stock bajo                              |
| `bg-success` / `text-success-foreground` | confirmaciones ("Producto guardado.")            |
| `bg-chart-1` / `bg-chart-2`              | gráfico de stock (azul) / gráfico de valor (ink) |

## Tipografía

Geist para texto, Geist Mono para números. Escala de Tailwind, sin tamaños arbitrarios.

| Uso                                | Clases                                          |
| ---------------------------------- | ----------------------------------------------- |
| Título de página (`h1`)            | `text-2xl font-semibold tracking-tight`         |
| Título de card / sección (`h2`)    | `text-base font-semibold`                       |
| Texto, tablas, controles           | `text-sm`                                       |
| Subtítulos, headers de tabla, pies | `text-xs text-muted-foreground`                 |
| Labels de form                     | `text-sm font-medium text-secondary-foreground` |
| Valor de KPI                       | `font-mono text-3xl font-medium`                |
| Stat de card de categoría          | `font-mono text-2xl font-medium`                |
| IDs, precios, stock, montos        | `font-mono`                                     |

## Espaciado y layout

- Base 4px. Página `px-8 py-6`; entre secciones `gap-6`; grids `gap-4`; card `[--card-spacing:--spacing(5)]` (el `Card` ya aplica el padding); form `p-6`.
- Todo control interactivo mide al menos `h-11` (44px). Los defaults de shadcn son más chicos (`Button` `h-8`, `size="icon"` `size-8`), así que cada receta sobrescribe: botones de texto `h-11`, botones icono `size-11`.
- Radios: `rounded-md` (links del nav, botones icono), `rounded-lg` (inputs, selects, botones), `rounded-xl` (cards).
- Shell: contenedor `flex flex-wrap`; `<nav className="flex-[1_1_224px]">` + `<main className="min-w-0 flex-[999_1_560px]">`. Debajo de ~784px el main (basis 560) no entra junto al nav y salta de línea: el nav queda arriba a ancho completo. En desktop el nav queda ~224px (el grow 999:1 le deja casi todo el sobrante al main). No usar `w-full md:w-56` + `flex-1` (basis 0: el main colapsa a 0 en la misma línea).
- Grids responsivos: `grid-cols-[repeat(auto-fit,minmax(200px,1fr))]` para KPIs, `minmax(240px,1fr)` para cards de categoría, `minmax(340px,1fr)` para gráficos.
- Tablas anchas dentro de `<div className="overflow-x-auto">`.

## Componentes

Los componentes de shadcn se instalan (`npx shadcn@latest add <nombre>`) cuando una pantalla los necesita por primera vez.

| Patrón                    | Componente          | Receta                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Botón Chat IA             | `Button`            | variante `default` + `h-11` + icono `Sparkles`                                                                                                                                                                                                                                                                                                                                     |
| Guardar / Agregar         | `Button`            | variante `ink`: `bg-foreground text-background hover:bg-foreground/90`. Agregarla en `src/components/ui/button.tsx` (`buttonVariants`) y, en esa misma edición, cambiar el hover de `default` a `hover:bg-primary/90` (`/80` da 3.79:1, bajo AA). Usar con `h-11`                                                                                                                  |
| Nuevo producto / Cancelar | `Button`            | `outline` + `h-11`                                                                                                                                                                                                                                                                                                                                                                 |
| Editar                    | `Button`            | `ghost`, `size="icon"` + `className="size-11"`, icono `Pencil`, `aria-label="Editar <nombre>"`                                                                                                                                                                                                                                                                                     |
| Eliminar                  | `Button`            | `ghost`, `size="icon"` + `className="size-11 text-destructive hover:bg-destructive/10 hover:text-destructive"`, icono `Trash2`, `aria-label="Eliminar <nombre>"`                                                                                                                                                                                                                   |
| Campo de form             | `Input` + `Label`   | `h-11 rounded-lg`; contenedor `flex flex-col gap-1.5`, label arriba                                                                                                                                                                                                                                                                                                                |
| Select                    | `Select`            | trigger `data-[size=default]:h-11 rounded-lg` (`h-11` pierde contra el `data-[size=default]:h-8` de shadcn)                                                                                                                                                                                                                                                                        |
| Búsqueda                  | `Input`             | contenedor `relative`; icono `Search` con `pointer-events-none absolute left-3 top-1/2 -translate-y-1/2`; `Input` con `pl-9`; label con `sr-only`                                                                                                                                                                                                                                  |
| Card                      | `Card`              | `[--card-spacing:--spacing(5)] ring-border` (sin `border` ni `p-5`: el `Card` ya trae `ring-1` y padding por `--card-spacing`)                                                                                                                                                                                                                                                     |
| KPI                       | `Card`              | label `text-xs text-muted-foreground`, valor `font-mono text-3xl font-medium`, pie `text-xs text-muted-foreground`                                                                                                                                                                                                                                                                 |
| KPI de alerta             | `Card`              | además `bg-warning ring-warning-border text-warning-foreground`                                                                                                                                                                                                                                                                                                                    |
| Badge de categoría        | `Badge`             | `secondary`, pill                                                                                                                                                                                                                                                                                                                                                                  |
| Badge de stock bajo       | `Badge`             | `bg-warning text-warning-foreground font-mono`, pill                                                                                                                                                                                                                                                                                                                               |
| Tabla                     | `Table`             | headers `text-xs font-medium text-muted-foreground`; filas `border-muted`; columnas numéricas `text-right font-mono`                                                                                                                                                                                                                                                               |
| Nav lateral               | `<nav>` propio      | `bg-sidebar text-sidebar-foreground`; link `h-11 rounded-md px-3`; activo `bg-sidebar-accent text-sidebar-accent-foreground` + `aria-current="page"`. No usar el `Sidebar` de shadcn                                                                                                                                                                                               |
| Panel de chat IA          | `Sheet`             | `side="right"`, `data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]` (pisa el `w-3/4` / `sm:max-w-sm` de shadcn); botón cerrar `X` propio con `size-11` (`showCloseButton={false}` + `SheetClose asChild`, el de shadcn mide `size-7`); burbuja usuario `bg-primary text-primary-foreground`, burbuja IA `bg-card border`; sugerencias `bg-accent text-accent-foreground` |
| Gráfico de stock          | `div` + CSS         | barras verticales `bg-chart-1 rounded-t-md`, altura en % del máximo; contenedor `role="img"` con `aria-label` que describa el gráfico                                                                                                                                                                                                                                              |
| Gráfico de valor          | `div` + CSS         | barras horizontales `bg-chart-2` sobre pista `bg-muted`, `h-2.5 rounded-full`                                                                                                                                                                                                                                                                                                      |
| Barra de stock bajo       | `div` + CSS         | `bg-warning-strong` sobre pista `bg-muted`                                                                                                                                                                                                                                                                                                                                         |
| Confirmación              | `<p role="status">` | `rounded-lg bg-success px-3.5 py-3 text-sm text-success-foreground`. La región `role="status"` está siempre en el DOM y solo cambia su texto (no montarla junto con el mensaje)                                                                                                                                                                                                    |
| Estado vacío              | `<p>`               | `py-8 text-center text-sm text-muted-foreground`                                                                                                                                                                                                                                                                                                                                   |

Gráficos: `div` + CSS. `@tanstack/react-charts` queda para un gráfico que CSS no resuelva.

## Iconos

`lucide-react`: `Boxes` (logo, Productos), `House` (Inicio), `Tag` (Categorías), `Plus` (Nuevo producto), `Sparkles` (Chat IA), `Search`, `Pencil`, `Trash2`, `X` (cerrar chat), `Send`. Los decorativos llevan `aria-hidden`; los botones solo-icono, `aria-label`.

## Reglas de dominio

- Stock bajo: `stock <= LOW_STOCK_THRESHOLD`, con `LOW_STOCK_THRESHOLD = 10`.
- Dinero: `'$' + value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.
- Cantidades: `value.toLocaleString('es-AR')`.
- Textos en español rioplatense, como el canvas ("Elegí una categoría").
