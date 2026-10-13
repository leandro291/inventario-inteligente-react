# Pantallas del canvas — Shell + Productos

Estado: implementada
Fase: 01 de 4

## Objetivo

Primera pantalla real del front: el listado de productos del inventario, con el layout (nav lateral) que comparten todas las pantallas. Fuente visual: canvas https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr (`project/Productos.dc.html` y el `<nav>` de `project/Main.dc.html`), con el look de `docs/DESIGN-SYSTEM.md`.

## Alcance

- Incluye:
  - Shell: `<nav>` lateral con logo "Inventario" (icono `Boxes`) y links; `<main>` fluido; en pantallas angostas el nav se apila arriba. La nav muestra solo links a pantallas implementadas (en esta fase: Productos).
  - `/products`: título "Productos", subtítulo "<n> productos", búsqueda por nombre y filtro por categoría (en cliente, estado en la URL: `?q=` y `?category=<id>`), tabla ID · Nombre · Categoría · Precio · Stock · Acciones.
  - Stock bajo (`stock <= 10`) como badge warning; precio con formato `es-AR` y 2 decimales.
  - Eliminar producto con confirmación (`AlertDialog`) e invalidación del listado.
  - Estados: cargando, error de red, sin productos, sin resultados ("Ningún producto coincide con la búsqueda.").
  - `/` redirige a `/products` hasta la fase 03.
  - Se elimina el placeholder `src/routes/home.tsx` y su test.
- No incluye:
  - Editar producto (no hay pantalla de edición).
  - Botones "Nuevo producto" (fase 02) y "Chat IA" (fase 04).
  - Inicio, Categorías, Nuevo producto, Chat IA.
  - Paginación u ordenamiento de la tabla.

## Contratos de datos

Back FastAPI en `VITE_API_URL` (hoy `http://127.0.0.1:8000`). Las colecciones llevan barra final.

| Método | Ruta             | Request | Response                                                |
| ------ | ---------------- | ------- | ------------------------------------------------------- |
| GET    | `/categories/`   | —       | `200` `Category[]`                                      |
| GET    | `/products/`     | —       | `200` `Product[]`                                       |
| DELETE | `/products/{id}` | —       | `204` sin cuerpo; `404` `{detail: "Product not found"}` |

Schemas zod (`src/modules/inventory/schemas/`), espejo de los `*Out` del back:

- `categorySchema`: `id` entero > 0, `nombre` string.
- `productSchema`: `id` entero > 0, `nombre` string, `precio` number, `stock` entero ≥ 0, `category_id` entero > 0.

Las respuestas se validan con `.parse` en el servicio; tipos `Category` y `Product` inferidos con `z.infer`.

## UI

- Ruta layout sin path que renderiza `AppShell` con `<Outlet />`; hijas: `/products` → `ProductsPage`; `/` → `<Navigate to="/products" replace />`.
- `AppShell` (`src/components/app-shell.tsx`): receta "Nav lateral" de DESIGN-SYSTEM; link activo con `NavLink` (`aria-current="page"`).
- `ProductsPage` compone: header, barra (búsqueda + select de categoría), `ProductTable`, `DeleteProductDialog`.
- `ProductTable`: recibe filas ya resueltas (`id`, `nombre`, `categoria`, `precio`, `stock`) y `onDelete(id)`; botón Eliminar según la receta (`size-11`, `aria-label="Eliminar <nombre>"`).
- `DeleteProductDialog`: presentacional (`open`, `productName`, `isPending`, `onConfirm`, `onOpenChange`).
- Categoría desconocida (FK sin match en la lista): se muestra "Sin categoría".

## Reutilización

| Necesidad                   | Se reutiliza / se crea                                             | Fuente                                       |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Botones                     | Se reutiliza                                                       | `src/components/ui/button.tsx`               |
| Tabla, select, badge, input | Se instala                                                         | shadcn `table`, `select`, `badge`, `input`   |
| Confirmación                | Se instala                                                         | shadcn `alert-dialog`                        |
| Iconos                      | Se reutiliza                                                       | `lucide-react` (`Boxes`, `Search`, `Trash2`) |
| Datos del servidor          | Se reutiliza                                                       | TanStack Query (ya montado en `main.tsx`)    |
| Estado de búsqueda/filtro   | Se reutiliza                                                       | `useSearchParams` de `react-router`          |
| Formato de dinero           | Se crea `formatMoney` en `src/lib/format.ts`                       | lo usan Productos, Categorías e Inicio       |
| Regla de stock bajo         | Se crea `LOW_STOCK_THRESHOLD` + `isLowStock` en `src/lib/stock.ts` | lo usan Productos e Inicio                   |
| Layout                      | Se crea `AppShell` en `src/components/`                            | lo usan todas las pantallas                  |

## Plan de tareas

Rutas relativas a `inventario-inteligente-react/`.

| ID  | Ola | Tarea                                                                                                                                   | Archivos (exclusivos)                                                                                                                                                                                                 | Tests                                                                                                     | Depende de |
| --- | --- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------- |
| T1  | 1   | Preparación: `npx shadcn@latest add table select badge alert-dialog input` y query keys del módulo                                      | `src/components/ui/table.tsx`, `select.tsx`, `badge.tsx`, `alert-dialog.tsx`, `input.tsx`, `src/modules/inventory/inventory.keys.ts`                                                                                  | —                                                                                                         | —          |
| T2  | 2   | Categorías: schema, servicio `getCategories`, hook `useCategories`                                                                      | `src/modules/inventory/schemas/category.schema.ts`, `src/modules/inventory/services/categories.service.ts`, `src/modules/inventory/hooks/use-categories.ts`                                                           | `tests/modules/inventory/categories.service.test.ts`                                                      | T1         |
| T3  | 2   | Productos: schema, servicio `getProducts`/`deleteProduct`, hooks `useProducts` y `useDeleteProduct` (invalida `inventoryKeys.products`) | `src/modules/inventory/schemas/product.schema.ts`, `src/modules/inventory/services/products.service.ts`, `src/modules/inventory/hooks/use-products.ts`, `src/modules/inventory/hooks/use-delete-product.ts`           | `tests/modules/inventory/products.service.test.ts`, `tests/modules/inventory/use-delete-product.test.tsx` | T1         |
| T4  | 2   | Shell y utilidades compartidas                                                                                                          | `src/components/app-shell.tsx`, `src/lib/format.ts`, `src/lib/stock.ts`                                                                                                                                               | `tests/lib/format.test.ts`, `tests/lib/stock.test.ts`, `tests/components/app-shell.test.tsx`              | T1         |
| T5  | 3   | Página Productos + integración de rutas; borrar placeholder                                                                             | `src/modules/inventory/pages/products-page.tsx`, `src/modules/inventory/components/product-table.tsx`, `src/modules/inventory/components/delete-product-dialog.tsx`, `src/router.tsx`, `src/routes/home.tsx` (borrar) | `tests/modules/inventory/products-page.test.tsx`; borrar `tests/home.test.tsx`                            | T2, T3, T4 |

`inventory.keys.ts` (T1) tiene exactamente este contenido; T2 y T3 lo importan:

```ts
export const inventoryKeys = {
  all: ['inventory'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  products: () => [...inventoryKeys.all, 'products'] as const,
}
```

T1 va sola en la ola 1: `shadcn add` toca archivos compartidos y deja el árbol estable para la ola 2.

## Criterios de aceptación

- [ ] CA1 `/` redirige a `/products`; `/products` se ve dentro del shell con la nav y el link Productos marcado con `aria-current="page"` (test de `products-page` o `app-shell`).
- [ ] CA2 La tabla lista los productos de `GET /products/` con el nombre de su categoría resuelto desde `GET /categories/`; "Sin categoría" si no hay match (test con servicios mockeados).
- [ ] CA3 Escribir en la búsqueda filtra por nombre sin distinguir mayúsculas y actualiza `?q=`; elegir una categoría filtra y actualiza `?category=`; abrir la URL con esos params aplica el filtro (test).
- [ ] CA4 Stock `<= 10` se muestra con badge `bg-warning text-warning-foreground`; `11` no (test de `isLowStock` en el borde 10/11 + test de la tabla).
- [ ] CA5 `formatMoney(1234.5)` devuelve `$1.234,50` (test).
- [ ] CA6 Eliminar abre un `AlertDialog` con el nombre del producto; confirmar llama `DELETE /products/{id}` e invalida `inventoryKeys.products()`; cancelar no llama al servicio (test).
- [ ] CA7 Estados visibles: cargando, error ("No se pudieron cargar los productos."), sin productos, y "Ningún producto coincide con la búsqueda." cuando el filtro deja 0 filas (test).
- [ ] CA8 Una respuesta del servicio que no cumple el schema hace fallar la query (test del servicio con un `precio` string).
- [ ] CA9 Controles con alto ≥ 44px según DESIGN-SYSTEM (`h-11`/`size-11`) y botón Eliminar con `aria-label` (revisión de código).
- [ ] CA10 Definition of Done: `npm run build`, `npm run lint`, `npx vitest run`, `npm run format:check` en verde.

## Preguntas abiertas

- Mensaje si falla el DELETE (p. ej. 404 porque otro usuario ya lo borró) — por defecto: el diálogo se cierra, se refresca el listado y no se muestra toast (no hay sistema de toasts todavía).
- `/` → redirect a `/products` hasta la fase 03 — por defecto: sí.

## Fases siguientes

- 02 — Nuevo producto (`/products/new`, `POST /products/`: `nombre` 3–100, `precio` > 0, `stock` entero ≥ 0, `category_id` > 0; zod igual al back) + Categorías (`/categories`: cards con productos y unidades por categoría calculados en cliente; alta `POST /categories/`, `nombre` 3–100).
- 03 — Inicio (`/`): KPIs, stock por categoría, valor por categoría, tabla "Reponer pronto"; derivado de products + categories.
- 04 — Chat IA (módulo `assistant`): `Sheet` lateral desde un botón en el header; `POST /ai/preguntar` `{pregunta: 3–500, thread_id}` → `{respuesta}`; `502` → "Falló el agente, intenta de nuevo".
