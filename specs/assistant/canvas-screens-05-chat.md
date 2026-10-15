# Pantallas del canvas — Chat IA

Estado: implementada
Fase: 05 de 5

## Objetivo

Preguntarle al agente SQL del back por productos, categorías y stock desde cualquier pantalla. Fuente visual: canvas https://claude.ai/artifact/1A69kPKbtKFKHH1BHSC2Zr (`project/ChatDrawer.dc.html`), con el look de `docs/DESIGN-SYSTEM.md` (receta "Panel de chat IA").

## Alcance

- Incluye:
  - Botón "Chat IA" (`default`, `h-11`, icono `Sparkles`) al pie de la nav del shell, visible en todas las pantallas. Desvío del canvas (que lo pone en el header de cada página): un solo punto de entrada, sin tocar las 4 páginas.
  - Panel lateral derecho (`Sheet`) con: header "Asistente de inventario" / "Preguntá sobre productos y stock" y botón cerrar propio (`size-11`, `aria-label="Cerrar chat"`); lista de mensajes; chips de sugerencias; campo "Mensaje" (placeholder "Escribí tu pregunta…") y botón enviar (`aria-label="Enviar"`, `size-11`, icono `Send`).
  - Mensaje inicial del asistente: "Hola, soy tu asistente. Puedo consultar productos, categorías y stock.".
  - Sugerencias (envían al hacer click): "Valor total del inventario", "¿Qué categoría tiene más stock?", "Productos con stock bajo".
  - Enviar: agrega la burbuja del usuario, vacía el campo, muestra "Pensando…" como burbuja del asistente y llama `POST /ai/preguntar`; la respuesta reemplaza "Pensando…".
  - Error: `502` → "Falló el agente, intentá de nuevo."; cualquier otro error → "No se pudo contactar al asistente."; el aviso va en `role="alert"`, se quita "Pensando…" y la pregunta vuelve al campo para reintentar.
  - Una conversación por carga de la app: `thread_id` generado una vez (`crypto.randomUUID()`); cerrar y reabrir el panel conserva los mensajes.
  - Texto de las respuestas como texto plano con saltos de línea (`whitespace-pre-line`), sin interpretar HTML ni markdown.
- No incluye:
  - Historial persistente entre recargas.
  - Markdown, streaming, adjuntos.
  - Que el chat modifique datos (el agente del back es de solo lectura).

## Contratos de datos

| Método | Ruta            | Request                                 | Response                                                        |
| ------ | --------------- | --------------------------------------- | --------------------------------------------------------------- |
| POST   | `/ai/preguntar` | `{pregunta: string, thread_id: string}` | `200` `{respuesta: string}`; `422` validación; `502` `{detail}` |

Schemas zod (`src/modules/assistant/schemas/ask.schema.ts`), espejo de `AskIn`/`AskOut` del back:

| Schema         | Campo       | Regla                 |
| -------------- | ----------- | --------------------- |
| `askSchema`    | `pregunta`  | string, `trim`, 3–500 |
| `askSchema`    | `thread_id` | string, 1–100         |
| `answerSchema` | `respuesta` | string                |

`ask(input)` re-parsea el input con `askSchema` y valida la respuesta con `answerSchema`. El campo de mensaje deshabilita "Enviar" mientras el texto recortado tenga menos de 3 caracteres o haya una pregunta en curso, y limita a 500 con `maxLength`.

Mensaje en la UI: `type ChatMessage = { id: string; author: 'user' | 'assistant'; text: string }`.

## UI

- `ChatSheet` (contenedor): estado de mensajes y `thread_id`, `useAsk`, `Sheet` con su trigger; receta "Panel de chat IA" de DESIGN-SYSTEM (`side="right"`, `data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]`, `showCloseButton={false}` + `SheetClose asChild`).
- `ChatMessages`: presentacional; recibe `ChatMessage[]` e `isPending`; lista con `role="log"` y `aria-live="polite"`; burbuja usuario `bg-primary text-primary-foreground` a la derecha, burbuja asistente `bg-card border` a la izquierda; "Pensando…" mientras `isPending`.
- `ChatComposer`: presentacional; chips de sugerencias (`bg-accent text-accent-foreground`, alto ≥ 44px), `Label` `sr-only` "Mensaje" + `Input` (`h-11`) + botón enviar; props `value`, `onChange`, `onSend(text)`, `isPending`.
- `AppShell` gana un slot `navFooter?: ReactNode` que se renderiza al pie de la nav; `router.tsx` le pasa `<ChatSheet />` (así `src/components` no importa nada de un módulo).

## Reutilización

| Necesidad            | Se reutiliza / se crea                              | Fuente                                   |
| -------------------- | --------------------------------------------------- | ---------------------------------------- |
| Panel lateral        | Se instala                                          | shadcn `sheet`                           |
| Input, Label, Button | Se reutiliza                                        | `src/components/ui/`                     |
| Cliente HTTP         | Se reutiliza                                        | `api` de `src/lib/api.ts`                |
| Mutación             | Se crea `useAsk` (sin invalidaciones: solo lectura) | `src/modules/assistant/hooks/`           |
| Iconos               | Se reutiliza                                        | `lucide-react` (`Sparkles`, `Send`, `X`) |
| Punto de entrada     | Se extiende `AppShell` con `navFooter`              | `src/components/app-shell.tsx`           |

## Plan de tareas

Rutas relativas a `inventario-inteligente-react/`. Módulo nuevo `src/modules/assistant/` (no importa nada de `inventory`).

| ID  | Ola | Tarea                                                                                                   | Archivos (exclusivos)                                                                                                                          | Tests                                                                                                                                         | Depende de |
| --- | --- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| T1  | 1   | Preparación: `npx shadcn@latest add sheet` (sin sobrescribir archivos existentes)                       | `src/components/ui/sheet.tsx`                                                                                                                  | —                                                                                                                                             | —          |
| T2  | 2   | Datos: `askSchema`, `answerSchema`, `ask`, `useAsk`                                                     | `src/modules/assistant/schemas/ask.schema.ts`, `src/modules/assistant/services/assistant.service.ts`, `src/modules/assistant/hooks/use-ask.ts` | `tests/modules/assistant/ask.schema.test.ts`, `tests/modules/assistant/assistant.service.test.ts`, `tests/modules/assistant/use-ask.test.tsx` | T1         |
| T3  | 2   | Presentacionales: lista de mensajes y composer (tipo `ChatMessage` exportado desde `chat-messages.tsx`) | `src/modules/assistant/components/chat-messages.tsx`, `src/modules/assistant/components/chat-composer.tsx`                                     | `tests/modules/assistant/chat-composer.test.tsx`                                                                                              | T1         |
| T4  | 3   | Contenedor e integración: `ChatSheet`, slot `navFooter` en `AppShell`, `router.tsx`                     | `src/modules/assistant/components/chat-sheet.tsx`, `src/components/app-shell.tsx`, `src/router.tsx`                                            | `tests/modules/assistant/chat-sheet.test.tsx`, `tests/components/app-shell.test.tsx`                                                          | T2, T3     |

T1 va sola en la ola 1 (`components/ui`). T4 va sola en la ola 3 (rutas y shell).

## Criterios de aceptación

- [ ] CA1 El botón "Chat IA" está en la nav en todas las pantallas; abre el panel con el título "Asistente de inventario" y el mensaje inicial; "Cerrar chat" lo cierra y al reabrir siguen los mensajes (tests).
- [ ] CA2 Enviar una pregunta llama `POST /ai/preguntar` con la pregunta recortada y el mismo `thread_id` en todas las preguntas de la sesión; aparece la burbuja del usuario, luego "Pensando…" y después la respuesta (tests del servicio y del contenedor).
- [ ] CA3 Una sugerencia envía su texto como pregunta (test).
- [ ] CA4 "Enviar" deshabilitado con menos de 3 caracteres recortados o con una pregunta en curso; el campo tiene `maxLength=500` (test del composer).
- [ ] CA5 `502` muestra "Falló el agente, intentá de nuevo." en `role="alert"`; otro error muestra "No se pudo contactar al asistente."; en ambos se quita "Pensando…" y la pregunta vuelve al campo (tests).
- [ ] CA6 Una respuesta que no cumple `answerSchema` cuenta como error; una respuesta con `<b>` se muestra como texto literal y los `\n` como saltos de línea (tests).
- [ ] CA7 La lista tiene `role="log"` y `aria-live="polite"`; campo con `Label` asociado; botones solo-icono con `aria-label`; controles ≥ 44px; panel `w-full` en angosto y 400px máx. desde `sm` (revisión de código + tests por rol).
- [ ] CA8 `AppShell` no importa nada de `src/modules/` (revisión de código).
- [ ] CA9 Definition of Done: `npm run build`, `npm run lint`, `npx vitest run`, `npm run format:check` en verde.

## Preguntas abiertas

- Ubicación del botón "Chat IA" — por defecto: al pie de la nav del shell (ver Alcance). Alternativa: en el header de cada página como el canvas, cuando Inicio (PR #4) esté en `main`.
- ¿Ocultar las sugerencias después de la primera pregunta? — por defecto: no, quedan siempre (como el canvas).

## Fases siguientes

- Ninguna dentro de "pantallas del canvas". Pendientes sueltos: unificar `summarizeInventory` con `summarizeCategories` (BUILD) y extraer el patrón de aviso de guardado cuando aparezca por tercera vez.
