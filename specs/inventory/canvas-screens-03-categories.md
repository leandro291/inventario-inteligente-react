# Pantallas del canvas — Categorías

Estado: implementada
Fase: 03 de 5

## Objetivo

Ver las categorías con cuántos productos y unidades tiene cada una, y dar de alta categorías nuevas. Fuente visual: canvas https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr (`project/Categorias.dc.html`), con el look de `docs/DESIGN-SYSTEM.md`. Las reglas de validación son las del back.

## Alcance

- Incluye:
  - `/categories`: título "Categorías", subtítulo "<n> categorías" (solo con la carga exitosa).
  - Formulario "Nueva categoría" (input + botón "Agregar") → `POST /categories/`. Al terminar bien: input vacío, "Categoría agregada." en la región `role="status"`, listado de categorías invalidado. Error del servidor o de red: "No se pudo agregar la categoría." y el input conserva lo escrito; el aviso se oculta al volver a editar.
  - Grilla de cards (`auto-fill minmax(240px,1fr)`), una por categoría: `#<id>` (mono), nombre, cantidad de productos y suma de unidades (mono), link "Ver productos" a `/products?category=<id>`.
  - Productos y unidades por categoría calculados en cliente desde `GET /products/`; una categoría sin productos muestra 0 y 0.
  - Estados: cargando, error ("No se pudieron cargar las categorías."), sin categorías ("Todavía no hay categorías.").
  - Nav: link "Categorías" (icono `Tag`) entre "Productos" y "Nuevo producto", como el canvas.
- No incluye:
  - Editar o eliminar categorías (el canvas solo dibuja el icono de editar; no hay pantalla).
  - Inicio (fase 04), Chat IA (fase 05).
  - Ordenar o buscar categorías.

## Contratos de datos

| Método | Ruta           | Request            | Response                           |
| ------ | -------------- | ------------------ | ---------------------------------- |
| POST   | `/categories/` | `{nombre: string}` | `201` `Category`; `422` validación |
| GET    | `/categories/` | —                  | `200` `Category[]` (ya existe)     |
| GET    | `/products/`   | —                  | `200` `Product[]` (ya existe)      |

`categoryCreateSchema` (en `category.schema.ts`, junto a `categorySchema`), espejo de `CategoryCreate` del back:

| Campo    | Regla                 | Mensaje                     |
| -------- | --------------------- | --------------------------- |
| `nombre` | string, `trim`, 3–100 | "Entre 3 y 100 caracteres." |

Tipo `CategoryCreate = z.infer<typeof categoryCreateSchema>`. `createCategory` valida la respuesta con `categorySchema` y envía el nombre recortado.

Resumen por categoría (`CategorySummary`): `{ id: number, nombre: string, productos: number, unidades: number }`.

## UI

- `CategoriesPage` compone: header, `CategoryForm`, grilla de `CategoryCard`; datos con `useCategorySummaries` y alta con `useCreateCategory`.
- `CategoryForm`: react-hook-form + `zodResolver(categoryCreateSchema)`; `Label` "Nueva categoría" + `Input` (`h-11`, placeholder "Ej.: Congelados") y botón "Agregar" (`ink`, `h-11`, deshabilitado mientras guarda), en fila que se apila en pantallas angostas; error con `aria-invalid`/`aria-describedby`; región `role="status"` siempre en el DOM; `noValidate`.
- `CategoryCard`: presentacional (`id`, `nombre`, `productos`, `unidades`); receta Card de DESIGN-SYSTEM (contenido en `CardContent`); link "Ver productos" con `text-primary` y alto ≥ 44px.

## Reutilización

| Necesidad                        | Se reutiliza / se crea                                           | Fuente                         |
| -------------------------------- | ---------------------------------------------------------------- | ------------------------------ |
| Categorías y productos           | Se reutiliza                                                     | `useCategories`, `useProducts` |
| Filtro por categoría al volver   | Se reutiliza (ya lee `?category=<id>`)                           | `ProductsPage` (fase 01)       |
| Formulario y validación          | Se reutiliza; mismo patrón que `ProductForm`                     | react-hook-form + zod          |
| Card, Input, Label, Button `ink` | Se reutiliza                                                     | `src/components/ui/`           |
| Mutación + invalidación          | Se crea `useCreateCategory`, mismo patrón que `useCreateProduct` | `src/modules/inventory/hooks/` |
| Agregados por categoría          | Se crea `summarizeCategories` + `useCategorySummaries`           | `src/modules/inventory/hooks/` |
| Nav                              | Se extiende `NAV_ITEMS`                                          | `src/components/app-shell.tsx` |

## Plan de tareas

Rutas relativas a `inventario-inteligente-react/`. No hay tarea de preparación: no se instala nada.

| ID  | Ola | Tarea                                                                                                                                                                                                 | Archivos (exclusivos)                                                                                                                                                                                           | Tests                                                                                                                                                                  | Depende de |
| --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| T1  | 1   | Alta de categoría: `categoryCreateSchema`, `createCategory`, `useCreateCategory` (invalida `inventoryKeys.categories()` en éxito)                                                                     | `src/modules/inventory/schemas/category.schema.ts`, `src/modules/inventory/services/categories.service.ts`, `src/modules/inventory/hooks/use-create-category.ts`                                                | `tests/modules/inventory/category-create.schema.test.ts`, `tests/modules/inventory/categories.service.test.ts`, `tests/modules/inventory/use-create-category.test.tsx` | —          |
| T2  | 1   | Agregados: función pura `summarizeCategories(categories, products): CategorySummary[]` y hook `useCategorySummaries` (combina `useCategories` + `useProducts`; expone `data`, `isPending`, `isError`) | `src/modules/inventory/hooks/use-category-summaries.ts`                                                                                                                                                         | `tests/modules/inventory/use-category-summaries.test.tsx`                                                                                                              | —          |
| T3  | 2   | Página, formulario, card e integración (ruta, nav)                                                                                                                                                    | `src/modules/inventory/pages/categories-page.tsx`, `src/modules/inventory/components/category-form.tsx`, `src/modules/inventory/components/category-card.tsx`, `src/router.tsx`, `src/components/app-shell.tsx` | `tests/modules/inventory/categories-page.test.tsx`, `tests/components/app-shell.test.tsx`                                                                              | T1, T2     |

T3 va sola en la ola 2 (registro de rutas).

## Criterios de aceptación

- [ ] CA1 `/categories` se abre desde el link "Categorías" de la nav, ubicado entre "Productos" y "Nuevo producto", con `aria-current="page"` (tests de `app-shell` y de la página).
- [ ] CA2 Cada card muestra `#id`, nombre, productos y unidades correctos; una categoría sin productos muestra 0 y 0; un producto cuya categoría no existe no se cuenta en ninguna (test de `summarizeCategories` + test de la página).
- [ ] CA3 "Ver productos" navega a `/products?category=<id>` y la tabla de Productos queda filtrada por esa categoría (test con la tabla de rutas real).
- [ ] CA4 Enviar un nombre de 2 caracteres (o solo espacios) muestra "Entre 3 y 100 caracteres." y no llama al servicio (test).
- [ ] CA5 Enviar un nombre válido llama `POST /categories/` con el nombre recortado; al terminar bien el input queda vacío, "Categoría agregada." aparece en la región `role="status"` (presente antes del mensaje) y se invalida `inventoryKeys.categories()` (tests).
- [ ] CA6 Si el `POST` falla: "No se pudo agregar la categoría.", el input conserva lo escrito y el aviso se oculta al volver a editar (test).
- [ ] CA7 Estados: cargando, error "No se pudieron cargar las categorías." (si falla categorías o productos), "Todavía no hay categorías."; el subtítulo "<n> categorías" solo con carga exitosa (test).
- [ ] CA8 Controles con alto ≥ 44px (input, botón, link "Ver productos") e input con `Label` asociado (revisión de código + test por `getByLabelText`).
- [ ] CA9 Definition of Done: `npm run build`, `npm run lint`, `npx vitest run`, `npm run format:check` en verde.

## Preguntas abiertas

- Nombre de categoría duplicado — por defecto: se permite (el back no tiene `UNIQUE` todavía; `ERM.md` lo marca pendiente). Cuando exista el constraint, el `422`/`409` cae en "No se pudo agregar la categoría.".
- Orden de las cards — por defecto: el que devuelve `GET /categories/`.

## Fases siguientes

- 04 — Inicio (`/`): KPIs, stock por categoría, valor por categoría, tabla "Reponer pronto"; reemplaza el redirect de `/`; reutiliza `summarizeCategories` si sirve.
- 05 — Chat IA (módulo `assistant`): `Sheet` lateral desde un botón en el header; `POST /ai/preguntar` `{pregunta: 3–500, thread_id}` → `{respuesta}`; `502` → "Falló el agente, intenta de nuevo".
