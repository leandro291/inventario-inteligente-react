# Design System

Cómo construir UI fiel al canvas "Inventario Inteligente" (https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr). Los valores viven en `src/index.css`; este documento explica cómo usarlos. Solo hay tema claro.

## Colores

Usar siempre las utilidades de Tailwind generadas por los tokens, nunca hex sueltos (`bg-[#2f5bea]`).

| Utilidad                                 | Uso                                              |
| ---------------------------------------- | ------------------------------------------------ |
| `bg-background`                          | fondo de página                                  |
| `text-foreground`                        | texto principal                                  |
| `bg-card`                                | cards, tablas, forms                             |
| `bg-primary` / `text-primary-foreground` | marca, acción principal (Chat IA), links         |
| `bg-secondary` / `bg-muted`              | badge de categoría, pista de barras              |
| `text-secondary-foreground`              | labels de form, texto de badge                   |
| `text-muted-foreground`                  | subtítulos, headers de tabla, pies               |
| `bg-accent` / `text-accent-foreground`   | hover suave, chips de sugerencia del chat        |
| `border-border`                          | bordes de cards y tablas (default de `border`)   |
| `border-input`                           | bordes de controles                              |
| `text-destructive`                       | eliminar                                         |
| `bg-sidebar*` / `text-sidebar*`          | nav lateral                                      |
| `bg-warning` / `text-warning-foreground` | stock bajo (KPI, badge)                          |
| `border-warning-border`                  | borde del KPI de stock bajo                      |
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

- Base 4px. Página `px-8 py-6`; entre secciones `gap-6`; grids `gap-4`; card `p-5`; form `p-6`.
- Todo control interactivo mide al menos `h-11` (44px).
- Radios: `rounded-md` (links del nav, botones icono), `rounded-lg` (inputs, selects, botones), `rounded-xl` (cards).
- Shell: `<nav>` lateral `w-56` + `<main className="min-w-0 flex-1">`. En pantallas angostas el nav se apila arriba (`flex flex-wrap`).
- Grids responsivos: `grid-cols-[repeat(auto-fit,minmax(200px,1fr))]` para KPIs, `minmax(240px,1fr)` para cards de categoría, `minmax(340px,1fr)` para gráficos.
- Tablas anchas dentro de `<div className="overflow-x-auto">`.

## Componentes

Los componentes de shadcn se instalan (`npx shadcn@latest add <nombre>`) cuando una pantalla los necesita por primera vez.

| Patrón                    | Componente          | Receta                                                                                                                                                                               |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Botón Chat IA             | `Button`            | variante `default` + icono `Sparkles`                                                                                                                                                |
| Guardar / Agregar         | `Button`            | variante `ink`: `bg-foreground text-background hover:bg-foreground/90`. Agregarla a `buttonVariants` al instalar `Button`                                                            |
| Nuevo producto / Cancelar | `Button`            | `outline`                                                                                                                                                                            |
| Editar                    | `Button`            | `ghost`, `size="icon"`, icono `Pencil`, `aria-label="Editar <nombre>"`                                                                                                               |
| Eliminar                  | `Button`            | `ghost`, `size="icon"`, `text-destructive`, icono `Trash2`, `aria-label="Eliminar <nombre>"`                                                                                         |
| Campo de form             | `Input` + `Label`   | `h-11 rounded-lg`; contenedor `flex flex-col gap-1.5`, label arriba                                                                                                                  |
| Select                    | `Select`            | trigger `h-11 rounded-lg`                                                                                                                                                            |
| Búsqueda                  | `Input`             | icono `Search` a la izquierda dentro del campo; label con `sr-only`                                                                                                                  |
| Card                      | `Card`              | `rounded-xl border bg-card p-5`                                                                                                                                                      |
| KPI                       | `Card`              | label `text-xs text-muted-foreground`, valor `font-mono text-3xl font-medium`, pie `text-xs text-muted-foreground`                                                                   |
| KPI de alerta             | `Card`              | además `bg-warning border-warning-border text-warning-foreground`                                                                                                                    |
| Badge de categoría        | `Badge`             | `secondary`, pill                                                                                                                                                                    |
| Badge de stock bajo       | `Badge`             | `bg-warning text-warning-foreground font-mono`, pill                                                                                                                                 |
| Tabla                     | `Table`             | headers `text-xs font-medium text-muted-foreground`; filas `border-muted`; columnas numéricas `text-right font-mono`                                                                 |
| Nav lateral               | `<nav>` propio      | `bg-sidebar text-sidebar-foreground`; link `h-11 rounded-md px-3`; activo `bg-sidebar-accent text-sidebar-accent-foreground` + `aria-current="page"`. No usar el `Sidebar` de shadcn |
| Panel de chat IA          | `Sheet`             | `side="right"`, `w-[400px] max-w-full`; burbuja usuario `bg-primary text-primary-foreground`, burbuja IA `bg-card border`; sugerencias `bg-accent text-accent-foreground`            |
| Gráfico de stock          | `div` + CSS         | barras verticales `bg-chart-1 rounded-t-md`, altura en % del máximo; contenedor `role="img"` con `aria-label` que describa el gráfico                                                |
| Gráfico de valor          | `div` + CSS         | barras horizontales `bg-chart-2` sobre pista `bg-muted`, `h-2.5 rounded-full`                                                                                                        |
| Barra de stock bajo       | `div` + CSS         | `bg-warning-strong` sobre pista `bg-muted`                                                                                                                                           |
| Confirmación              | `<p role="status">` | `rounded-lg bg-success px-3.5 py-3 text-sm text-success-foreground`                                                                                                                  |
| Estado vacío              | `<p>`               | `py-8 text-center text-sm text-muted-foreground`                                                                                                                                     |

Gráficos: `div` + CSS. `@tanstack/react-charts` queda para un gráfico que CSS no resuelva.

## Iconos

`lucide-react`: `Boxes` (logo, Productos), `House` (Inicio), `Tag` (Categorías), `Plus` (Nuevo producto), `Sparkles` (Chat IA), `Search`, `Pencil`, `Trash2`, `X` (cerrar chat), `Send`. Los decorativos llevan `aria-hidden`; los botones solo-icono, `aria-label`.

## Reglas de dominio

- Stock bajo: `stock <= LOW_STOCK_THRESHOLD`, con `LOW_STOCK_THRESHOLD = 10`.
- Dinero: `'$' + value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.
- Cantidades: `value.toLocaleString('es-AR')`.
- Textos en español rioplatense, como el canvas ("Elegí una categoría").
