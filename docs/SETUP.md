# SETUP

Reglas obligatorias del proyecto: estructura de carpetas, buenas prácticas y convenciones de desarrollo. Todo código nuevo debe cumplirlas.

---

## 1. Estructura de carpetas

### 1.1 Organización por módulos de dominio

El código de negocio vive en `src/modules/<dominio>/`. Lo compartido entre dominios vive en las carpetas raíz de `src/`.

```
src/
├── main.tsx                  # providers (Query, Router). Único punto de montaje
├── router.tsx                # tabla de rutas; importa páginas de los módulos
├── index.css                 # Tailwind + tema shadcn
├── components/
│   ├── ui/                   # generado por shadcn — no editar a mano
│   └── <shared>.tsx          # componentes reutilizables entre dominios
├── hooks/                    # hooks reutilizables entre dominios
├── lib/                      # infraestructura: api.ts (axios), utils.ts (cn)
└── modules/
    └── <domain>/             # ej: products, inventory, suppliers
        ├── pages/            # componentes de ruta
        ├── components/       # componentes propios del dominio
        ├── hooks/            # hooks de TanStack Query y lógica del dominio
        ├── services/         # llamadas HTTP con `api`
        ├── schemas/          # schemas zod + tipos inferidos
        ├── stores/           # zustand, solo si hay estado global del dominio
        └── <domain>.keys.ts  # query keys de TanStack Query

tests/
├── setup.ts
└── modules/<domain>/...      # espejo de src/
```

Reglas:

- **Nombres de carpetas y archivos en inglés**, en `kebab-case`, en singular o plural según el dominio (`products`, `inventory`).
- **Una subcarpeta se crea cuando hay un archivo para poner en ella**, no antes. Un módulo con una página y un servicio tiene solo `pages/` y `services/`.
- **Un módulo no importa archivos internos de otro módulo.** Si dos módulos necesitan lo mismo, se sube a `src/components`, `src/hooks` o `src/lib`.
- **Sin barrels (`index.ts`)**: se importa el archivo directo (`@/modules/products/hooks/use-products`). Evita ciclos y mantiene rápido el HMR.
- Siempre importar con el alias `@/`, nunca rutas relativas que suban de carpeta (`../../`).

### 1.2 Naming

| Elemento              | Archivo                | Identificador                   | Ejemplo                                        |
| --------------------- | ---------------------- | ------------------------------- | ---------------------------------------------- |
| Componente            | `kebab-case.tsx`       | `PascalCase`                    | `product-table.tsx` → `ProductTable`           |
| Página                | `kebab-case-page.tsx`  | `PascalCase` + `Page`           | `products-page.tsx` → `ProductsPage`           |
| Hook                  | `use-kebab-case.ts`    | `useCamelCase`                  | `use-products.ts` → `useProducts`              |
| Servicio              | `<domain>.service.ts`  | funciones `camelCase` con verbo | `products.service.ts` → `getProducts`          |
| Schema zod            | `<entity>.schema.ts`   | `camelCase` + `Schema`          | `product.schema.ts` → `productSchema`          |
| Tipo inferido         | (mismo archivo)        | `PascalCase`, sin prefijo `I`   | `type Product = z.infer<typeof productSchema>` |
| Store zustand         | `<name>.store.ts`      | `use` + `PascalCase` + `Store`  | `cart.store.ts` → `useCartStore`               |
| Query keys            | `<domain>.keys.ts`     | `camelCase` + `Keys`            | `productKeys`                                  |
| Props                 | (mismo archivo)        | `PascalCase` + `Props`          | `ProductTableProps`                            |
| Constante real        | —                      | `UPPER_SNAKE_CASE`              | `MAX_STOCK_ALERT`                              |
| Booleano              | —                      | prefijo `is` / `has` / `can`    | `isLoading`, `hasStock`                        |
| Handler / prop evento | —                      | `handleX` / `onX`               | `handleSubmit`, `onSelect`                     |
| Test                  | `<archivo>.test.ts(x)` | —                               | `tests/modules/products/use-products.test.ts`  |

- **Exports con nombre** (`export function ProductTable`), nunca `export default`.
- Para tipos de objetos usar `type`, no `interface`.

### 1.3 Reglas de TypeScript estricto y cómo aplicarlas

| Regla del compilador        | Qué implica al escribir código                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strict`                    | Prohibido `any`. Datos desconocidos se tipan `unknown` y se validan con zod o se estrechan con guards.                                            |
| `noUncheckedIndexedAccess`  | `items[0]` y `record[key]` son `T \| undefined`: comprobar antes de usar (`if (!item) return`) o usar `.find()`/`.at()` y manejar el `undefined`. |
| `verbatimModuleSyntax`      | Tipos se importan con `import type { Product } from ...`.                                                                                         |
| `erasableSyntaxOnly`        | Sin `enum` ni `namespace`. Usar uniones literales u objetos `as const`.                                                                           |
| `noImplicitReturns`         | Toda rama de una función con retorno devuelve un valor.                                                                                           |
| `noUnusedLocals/Parameters` | No dejar variables ni parámetros sin usar; si un parámetro es obligatorio por firma, prefijarlo con `_`.                                          |

Ejemplos:

```ts
// ❌ enum
enum Status {
  Active,
  Inactive,
}

// ✅ unión derivada de un objeto as const
export const PRODUCT_STATUS = {
  active: 'active',
  inactive: 'inactive',
} as const
export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]
```

```ts
// ✅ la respuesta HTTP es un borde de confianza: se valida con zod en el servicio
import { api } from '@/lib/api'
import {
  productSchema,
  type Product,
} from '@/modules/products/schemas/product.schema'

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<unknown>('/products')
  return productSchema.array().parse(data)
}
```

```tsx
// ✅ extender un componente shadcn heredando sus props
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type SubmitButtonProps = ComponentProps<typeof Button> & { isLoading: boolean }

export function SubmitButton({
  isLoading,
  disabled,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isLoading || disabled} {...props}>
      {children}
    </Button>
  )
}
```

- No usar `!` (non-null assertion) ni `as` para silenciar errores. Única excepción existente: `document.getElementById('root')!` en `main.tsx`.
- Los tipos de entidades se **infieren de zod** (`z.infer`), no se escriben a mano duplicados.

---

## 2. Buenas prácticas

Se aplican siempre: al crear o envolver componentes shadcn, componentes propios, hooks, servicios, stores y schemas.

### 2.1 SOLID aplicado a React

- **S — Responsabilidad única**
  - El **servicio** hace HTTP.
  - El **hook** maneja datos y estado (TanStack Query, lógica).
  - El **componente** renderiza.
  - La **página** compone.
  - Un componente que hace fetch, transforma datos y renderiza una tabla se divide.
- **O — Abierto/cerrado**: se extiende por props, `variants` (cva) y composición (`children`). No se modifica un componente de `components/ui/` para un caso puntual; se envuelve.
- **L — Sustitución de Liskov**: un wrapper de un componente shadcn acepta y reenvía las props del original (`...props`), así puede usarse donde se usaba el original.
- **I — Segregación de interfaces**: los componentes reciben solo las props que usan. Mejor `name` y `stock` que la entidad `product` completa si solo se muestran esos dos campos.
- **D — Inversión de dependencias**: el flujo de dependencias es siempre `page → components/hooks → services → lib/api`. Un componente nunca importa `axios` ni `api`; consume un hook.

### 2.2 DRY

- Un schema zod es la **única fuente** de: validación de formularios (react-hook-form + `zodResolver`), validación de respuestas HTTP y tipos TS.
- Query keys centralizadas en `<domain>.keys.ts`; nunca strings sueltos en `useQuery`.
- Regla de tres: la primera vez se escribe, la segunda se nota, la tercera se extrae. Lo extraído va al módulo si es del dominio, a `src/` si lo usan varios dominios.

### 2.3 KISS

- Elegir el estado más simple que funcione, en este orden:
  1. `useState` local.
  2. Estado en la URL (filtros, paginación, búsqueda).
  3. TanStack Query para **datos del servidor**.
  4. Zustand solo para estado global **del cliente**.
- **Nunca** copiar datos del servidor en zustand.
- Preferir HTML y CSS nativos (Tailwind) antes que lógica JS.
- Código obvio antes que código ingenioso.

### 2.4 YAGNI

- No crear props, variantes, carpetas, abstracciones ni configuraciones "por si acaso".
- No instalar dependencias para lo que se resuelve con pocas líneas o con lo ya instalado.
- Solo se construye lo que el requisito pide.

---

## 3. Desarrollo

### 3.1 Reutilizar antes de crear

Antes de crear **cualquier** componente, hook, función o servicio, en este orden:

1. **¿Ya existe en el repo?** Buscar en `src/components`, `src/hooks`, `src/lib` y en el módulo:
   ```bash
   grep -rni "<nombre o concepto>" src/
   ```
2. **¿Existe en shadcn?** Buscar y revisar:
   ```bash
   npx shadcn@latest search @shadcn -q "<concepto>"
   npx shadcn@latest docs <componente>
   npx shadcn@latest add <componente>
   ```
3. **¿Lo resuelve una librería ya instalada?** (TanStack Table/Query/Charts, react-hook-form, zod, radix-ui, lucide-react).
4. **Solo entonces se crea**, pensado para ser reutilizable: props genéricas, sin datos del dominio hardcodeados si puede vivir en `src/components`.

### 3.2 Unit testing

Los tests viven en `tests/` replicando la ruta de `src/` (`tests/modules/products/...`).

**Requieren test:**

- Hooks con lógica (transformaciones, estados derivados, mutaciones).
- Servicios: el parseo/validación con zod de las respuestas.
- Schemas zod con reglas de negocio (validaciones de formularios).
- Stores de zustand.
- Utilidades en `lib/` o del dominio.
- Componentes con lógica condicional relevante (estados vacío/error/carga, permisos).

**No requieren test:**

- Componentes puramente presentacionales.
- `src/components/ui/` (código de shadcn).

En tests de hooks y componentes se mockea la capa de servicio (`vi.mock`), nunca axios directo.

### 3.3 Definition of Done

Un feature está terminado cuando:

- [ ] Cumple los criterios de aceptación acordados.
- [ ] `npm run build` pasa (incluye type-check).
- [ ] `npm run lint` pasa.
- [ ] `npx vitest run` pasa.
- [ ] `npm run format:check` pasa.
