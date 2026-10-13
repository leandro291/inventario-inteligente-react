# Pantallas del canvas — Nuevo producto

Estado: aprobada
Fase: 02 de 5

## Objetivo

Dar de alta productos desde la UI. Fuente visual: canvas https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr (`project/ProductoNuevo.dc.html`), con el look de `docs/DESIGN-SYSTEM.md`. Las reglas de validación son las del back (mandan sobre el canvas).

## Alcance

- Incluye:
  - `/products/new`: link "← Productos", título "Nuevo producto", formulario (Nombre, Precio ($), Stock (unidades), Categoría) y panel "Vista previa".
  - Validación con zod igual al back, mensajes en español debajo de cada campo.
  - Guardar → `POST /products/`; al terminar bien: mensaje "Producto guardado." en la región `role="status"`, formulario vacío de nuevo, listado de productos invalidado. Se queda en la pantalla (como el canvas).
  - Error del servidor o de red: "No se pudo guardar el producto." y el formulario conserva lo escrito.
  - Cancelar → `/products`.
  - Vista previa en vivo: nombre (o "Nombre del producto"), categoría (o "Sin categoría") y "Valor en stock" = precio × stock con `formatMoney`.
  - Botón "Nuevo producto" (outline) en el header de `/products`.
  - Nav: link "Nuevo producto" (icono `Plus`); "Productos" queda activo solo en `/products` exacto.
  - Variante `ink` de `Button` y hover de `default` a `/90`, como indica DESIGN-SYSTEM.
- No incluye:
  - Editar producto.
  - Categorías (fase 03), Inicio (fase 04), Chat IA (fase 05).
  - Crear una categoría desde este formulario.
  - Toasts.

## Contratos de datos

| Método | Ruta         | Request                                                          | Response                          |
| ------ | ------------ | ---------------------------------------------------------------- | --------------------------------- |
| POST   | `/products/` | `{nombre: string, precio: number, stock: int, category_id: int}` | `201` `Product`; `422` validación |

`productCreateSchema` (en `product.schema.ts`, junto a `productSchema`), espejo de `ProductCreate` del back:

| Campo         | Regla                 | Mensaje                        |
| ------------- | --------------------- | ------------------------------ |
| `nombre`      | string, `trim`, 3–100 | "Entre 3 y 100 caracteres."    |
| `precio`      | number > 0            | "Tiene que ser mayor a 0."     |
| `stock`       | entero ≥ 0            | "Tiene que ser un entero ≥ 0." |
| `category_id` | entero > 0            | "Elegí una categoría."         |

Tipo `ProductCreate = z.infer<typeof productCreateSchema>`. Los inputs numéricos entregan número al schema (`valueAsNumber` o coerción); un campo vacío no pasa la validación. `createProduct` valida la respuesta con `productSchema`.

## UI

- `NewProductPage` compone: header, `ProductForm`, `ProductPreview`; obtiene categorías con `useCategories` y guarda con `useCreateProduct`.
- `ProductForm`: react-hook-form + `zodResolver(productCreateSchema)`; `Label` + `Input` por campo (`h-11`), `Select` de categoría (`data-[size=default]:h-11`, placeholder "Elegí una categoría"); errores con `aria-invalid` y `aria-describedby`; botones Cancelar (`outline`, `h-11`) y "Guardar producto" (`ink`, `h-11`, deshabilitado mientras guarda).
- `ProductPreview`: presentacional (`nombre`, `categoria`, `precio`, `stock`); receta Card de DESIGN-SYSTEM.
- Categorías cargando: select deshabilitado; error al cargarlas: "No se pudieron cargar las categorías." y el formulario no se puede enviar.
- Layout como el canvas: formulario y vista previa lado a lado, vista previa abajo en pantallas angostas (`flex flex-wrap`).

## Reutilización

| Necesidad                | Se reutiliza / se crea                                          | Fuente                                                     |
| ------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Categorías               | Se reutiliza                                                    | `useCategories` (fase 01)                                  |
| Formato de dinero        | Se reutiliza                                                    | `src/lib/format.ts`                                        |
| Formulario y validación  | Se reutiliza                                                    | react-hook-form + `@hookform/resolvers` + zod (instalados) |
| Input, Select            | Se reutiliza                                                    | `src/components/ui/input.tsx`, `select.tsx`                |
| Label, Card              | Se instala                                                      | shadcn `label`, `card`                                     |
| Botón "Guardar producto" | Se extiende `Button` con variante `ink`                         | `src/components/ui/button.tsx` (DESIGN-SYSTEM)             |
| Mutación + invalidación  | Se crea `useCreateProduct`, mismo patrón que `useDeleteProduct` | `src/modules/inventory/hooks/`                             |
| Nav                      | Se extiende `NAV_ITEMS`                                         | `src/components/app-shell.tsx`                             |

## Plan de tareas

Rutas relativas a `inventario-inteligente-react/`.

| ID  | Ola | Tarea                                                                                                                                                                                                                                    | Archivos (exclusivos)                                                                                                                                                                                      | Tests                                                                                                                                                              | Depende de |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| T1  | 1   | Preparación: `npx shadcn@latest add label card` (sin sobrescribir `button.tsx`); en `button.tsx` agregar variante `ink` (`bg-foreground text-background hover:bg-foreground/90`) y cambiar el hover de `default` a `hover:bg-primary/90` | `src/components/ui/label.tsx`, `src/components/ui/card.tsx`, `src/components/ui/button.tsx`                                                                                                                | —                                                                                                                                                                  | —          |
| T2  | 2   | Alta de producto: `productCreateSchema`, `createProduct`, `useCreateProduct` (invalida `inventoryKeys.products()` en éxito)                                                                                                              | `src/modules/inventory/schemas/product.schema.ts`, `src/modules/inventory/services/products.service.ts`, `src/modules/inventory/hooks/use-create-product.ts`                                               | `tests/modules/inventory/product-create.schema.test.ts`, `tests/modules/inventory/products.service.test.ts`, `tests/modules/inventory/use-create-product.test.tsx` | T1         |
| T3  | 2   | Vista previa                                                                                                                                                                                                                             | `src/modules/inventory/components/product-preview.tsx`                                                                                                                                                     | `tests/modules/inventory/product-preview.test.tsx`                                                                                                                 | T1         |
| T4  | 3   | Página, formulario e integración (ruta, nav, botón en Productos)                                                                                                                                                                         | `src/modules/inventory/pages/new-product-page.tsx`, `src/modules/inventory/components/product-form.tsx`, `src/router.tsx`, `src/components/app-shell.tsx`, `src/modules/inventory/pages/products-page.tsx` | `tests/modules/inventory/new-product-page.test.tsx`, `tests/components/app-shell.test.tsx`, `tests/modules/inventory/products-page.test.tsx`                       | T2, T3     |

T1 va sola en la ola 1 (archivos compartidos de `components/ui`). T4 va sola en la ola 3 (registro de rutas).

## Criterios de aceptación

- [ ] CA1 `/products/new` se abre desde el link "Nuevo producto" de la nav y desde el botón "Nuevo producto" del header de `/products`; en `/products/new` solo "Nuevo producto" tiene `aria-current="page"` (tests de `app-shell` y de la página).
- [ ] CA2 Enviar con campos inválidos muestra el mensaje de cada regla de la tabla y no llama al servicio (test con nombre de 2 caracteres, precio 0, stock 1.5 y sin categoría).
- [ ] CA3 Enviar datos válidos llama `POST /products/` con `nombre` sin espacios de borde y `precio`, `stock`, `category_id` como números (test del servicio + test de la página).
- [ ] CA4 Al guardar bien: "Producto guardado." aparece en la región `role="status"` (que existe en el DOM antes del mensaje), el formulario queda vacío y se invalida `inventoryKeys.products()` (tests).
- [ ] CA5 Si el `POST` falla: "No se pudo guardar el producto." y los campos conservan lo escrito (test).
- [ ] CA6 La vista previa refleja lo escrito: placeholders con el formulario vacío y `$12,50` de "Valor en stock" con precio 2.5 y stock 5 (tests de `ProductPreview` y de la página).
- [ ] CA7 Con categorías cargando el select está deshabilitado; si fallan, "No se pudieron cargar las categorías." y "Guardar producto" deshabilitado (test).
- [ ] CA8 `button.tsx` tiene la variante `ink` y `default` usa `hover:bg-primary/90` (revisión de código).
- [ ] CA9 Cada input tiene `Label` asociado; controles con alto ≥ 44px según DESIGN-SYSTEM (revisión de código + test por `getByLabelText`).
- [ ] CA10 Definition of Done: `npm run build`, `npm run lint`, `npx vitest run`, `npm run format:check` en verde.

## Preguntas abiertas

- Después de guardar, ¿quedarse o volver a `/products`? — por defecto: quedarse con el formulario vacío y el mensaje, como el canvas (permite cargar varios seguidos).
- Paso del input de precio — por defecto: `step="0.01"` (el back guarda `DECIMAL(10,4)`, pero la UI muestra 2 decimales).

## Fases siguientes

- 03 — Categorías (`/categories`): cards con productos y unidades por categoría (calculados en cliente), link "Ver productos" a `/products?category=<id>`, alta con `POST /categories/` (`nombre` 3–100); link en la nav.
- 04 — Inicio (`/`): KPIs, stock por categoría, valor por categoría, tabla "Reponer pronto"; reemplaza el redirect de `/`.
- 05 — Chat IA (módulo `assistant`): `Sheet` lateral desde un botón en el header; `POST /ai/preguntar` `{pregunta: 3–500, thread_id}` → `{respuesta}`; `502` → "Falló el agente, intenta de nuevo".
