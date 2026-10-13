# CLAUDE.md

Front de Inventario Inteligente: React 19, Vite 8, TypeScript 6, Tailwind v4, shadcn (`radix-nova`, iconos `lucide-react`).

@docs/SETUP.md
@docs/DESIGN-SYSTEM.md

## Comandos

```bash
npm run dev                             # Vite
npm run build                           # tsc -b (src/ y tests/) + vite build; único type-check
npm run lint                            # oxlint
npx vitest run [archivo] [-t "nombre"]  # tests una vez
npm run format                          # prettier --write .
npx shadcn@latest add <componente>      # a src/components/ui
```

## Lo que no está en SETUP

- react-router 8: importar de `react-router` (no existe `react-router-dom`); router de datos con `createBrowserRouter`.
- Versiones con APIs nuevas: zod 4, TanStack Table v9, `@tanstack/react-charts` 1.x, zustand 5, react-hook-form + `@hookform/resolvers`.
- Tailwind v4 sin `tailwind.config`: el tema vive en `src/index.css`. `cn` viene del paquete `cn`, re-exportado en `src/lib/utils.ts`.
- Nuevas `VITE_*`: tipar en `src/vite-env.d.ts` y agregar a `.env.example`.
- Tests sin globals (importar de `vitest`); config de Vitest en `vite.config.ts` (jsdom).
- `exactOptionalPropertyTypes` desactivado a propósito: choca con shadcn y react-hook-form.
- Prettier: sin punto y coma, comillas simples. No correr `npm audit fix --force` (baja shadcn a 1.0).
- SDD: sesión principal con `claude --agent orchestrator`; ninguna spec se implementa sin `Estado: aprobada` puesto tras la respuesta del usuario.
