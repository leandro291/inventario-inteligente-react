# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reglas y metodología

**Antes de crear o modificar código, leer y cumplir [`docs/SETUP.md`](docs/SETUP.md)**: estructura por módulos de dominio, naming, reglas de TS estricto, SOLID/DRY/KISS/YAGNI, reutilizar antes de crear (repo → shadcn → libs instaladas), criterios SDD vs BUILD, tamaño de sesión, paralelismo por olas, unit testing y Definition of Done.

Trabajo con Spec Driven Development mediante los agentes de [`.claude/agents/`](.claude/agents/):

| Agente                                           | Rol                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`orchestrator`](.claude/agents/orchestrator.md) | Sesión principal (`claude --agent orchestrator`). Clasifica SDD/BUILD, pide aprobación, lanza developers por olas, loop de revisión. |
| [`spec`](.claude/agents/spec.md)                 | Escribe `specs/<domain>/<feature>.md` con inventario de reutilización y plan de tareas con archivos exclusivos por ola.              |
| [`developer`](.claude/agents/developer.md)       | Implementa una tarea (o un cambio BUILD) solo en sus archivos, con tests.                                                            |
| [`reviewer`](.claude/agents/reviewer.md)         | Valida contra la spec, SETUP y DoD; devuelve `APROBADO` o `CAMBIOS REQUERIDOS` (máx. 3 rondas).                                      |

- **Ninguna spec se implementa sin aprobación explícita de un humano.** Una spec solo se implementa con `Estado: aprobada`, y ese estado lo pone el orquestador después de la respuesta del usuario. Sin eso, el developer se bloquea.
- Antes de crear un componente, hook o función, verificar que no exista (repo, shadcn, librerías instaladas).
- Tareas en paralelo solo con archivos disjuntos. Los archivos compartidos (`router.tsx`, `package.json`, `components/ui/*`, etc.) se tocan en tareas secuenciales.

## Comandos

```bash
npm run dev            # servidor Vite
npm run build          # tsc -b (type-check de src/ y tests/) + vite build
npm run lint           # oxlint
npm test               # vitest en modo watch
npx vitest run         # todos los tests una vez
npx vitest run tests/home.test.tsx      # un archivo
npx vitest run -t "renderiza el título" # un test por nombre
npm run format         # prettier --write .
npm run format:check
npx shadcn@latest add <componente>      # agrega componentes a src/components/ui
```

No hay script de type-check aislado: `npm run build` es el que corre `tsc`.

## Stack y versiones que cambian APIs

- React 19, Vite 8, TypeScript 6, Tailwind v4.
- **react-router 8**: importar desde `react-router` (no existe `react-router-dom`). Router de datos con `createBrowserRouter`.
- **zod 4**, **TanStack Table v9**, **@tanstack/react-charts 1.x**, **react-hook-form** + `@hookform/resolvers`, **zustand 5**.
- Tailwind v4 sin `tailwind.config`: tema y variables CSS de shadcn viven en `src/index.css`.
- shadcn estilo `radix-nova` (base Radix vía paquete `radix-ui`, iconos `lucide-react`, fuente Geist). Config en `components.json`.
- `cn` viene del paquete `cn` (oficial de shadcn, reemplaza clsx + tailwind-merge), re-exportado en `src/lib/utils.ts`.

Zustand, zod, react-hook-form, Table y Charts están instalados pero aún sin uso en el código.

## Arquitectura

- `src/main.tsx`: único lugar con providers (`QueryClientProvider` + devtools, `RouterProvider`). Un solo `QueryClient` con opciones por defecto.
- `src/router.tsx`: tabla de rutas; las páginas viven en `src/modules/<domain>/pages/` (`src/routes/home.tsx` es un placeholder previo a esa regla).
- `src/lib/api.ts`: instancia de axios `api` con `baseURL` = `VITE_API_URL`. Usar `api`, no `axios` directo.
- Variables de entorno: tipadas en `src/vite-env.d.ts`; toda nueva `VITE_*` va ahí y en `.env.example` (`.env` está en `.gitignore`).
- `src/components/ui/`: código generado por shadcn, excluido de oxlint (`.oxlintrc.json`). Regenerar con el CLI antes que editar a mano.
- Alias `@/` → `src/` (definido en `vite.config.ts` y `tsconfig.json`/`tsconfig.app.json`).

## Tests

- Viven en `tests/` (fuera de `src/`), patrón `tests/**/*.test.{ts,tsx}`. Config de Vitest dentro de `vite.config.ts` (jsdom).
- Sin globals: importar `test`, `expect`, etc. desde `vitest`. `tests/setup.ts` registra los matchers de jest-dom y hace `cleanup`.
- `tsconfig.app.json` incluye `tests/`, así que el build también los type-checkea.

## Convenciones

- TS estricto con `noUncheckedIndexedAccess` (indexar arrays/records devuelve `T | undefined`), `noImplicitOverride`, `noImplicitReturns`, `verbatimModuleSyntax` (usar `import type`) y `erasableSyntaxOnly` (sin `enum` ni `namespace`).
- `exactOptionalPropertyTypes` está desactivado a propósito: choca con los tipos de shadcn y react-hook-form.
- Prettier: sin punto y coma, comillas simples.
- `npm audit` reporta `braces` vía el CLI de shadcn (solo tooling). No correr `npm audit fix --force`: baja shadcn a 1.0.
