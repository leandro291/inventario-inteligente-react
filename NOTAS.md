# Notas — mejoras del chat IA

Ideas para mejorar el chat del asistente (fase 05). Estado actual: un `thread_id` por carga de página, memoria del agente en RAM del back (`InMemorySaver`), sugerencias fijas, sin streaming, respuestas en markdown.

## Rápidas (solo front, BUILD)

1. **Nueva conversación** — botón en el header del panel que genera un `thread_id` nuevo y vacía los mensajes (reiniciar el contexto).
2. **Auto-scroll y foco** — bajar al último mensaje cuando llega uno nuevo; foco en el campo al abrir el panel.
3. **Reintentar y cancelar** — al fallar, botón "Reintentar" en lugar de devolver el texto al campo (hoy la pregunta queda duplicada si se reintenta); botón "Detener" mientras piensa (`AbortController`).
4. **Copiar respuesta** — ícono en cada burbuja del asistente.
5. **Links internos** — si el agente responde con un link a `/products?q=…`, navegar dentro de la app en lugar de abrir otra pestaña.
6. **Cargar el chat recién al abrirlo** (`React.lazy`) — saca del bundle inicial los ~157 kB que sumó markdown.

## Medianas

7. **Sugerencias con datos reales** — armar los chips con el inventario actual (p. ej. "¿Cuándo repongo Lavandina?" si tiene stock bajo, "¿Cuánto vale Bebidas?" para la categoría de mayor valor). Solo front, con los datos que ya carga.
8. **Contexto de pantalla** — enviar al agente dónde está el usuario (p. ej. "viendo Productos filtrado por Bebidas") para preguntas como "¿cuál de estos se agota primero?". Cambia el contrato de `POST /ai/preguntar` (front + back).
9. **Conversación que sobrevive a recargar** — guardar mensajes y `thread_id` en `localStorage`. Ojo: si el back reinicia, el agente olvida la conversación aunque el front la muestre (ver 12).

## Grandes (front + back)

10. **Streaming** — que la respuesta se escriba de a poco en lugar de esperar con "Pensando…". Back: `StreamingResponse` con `agent.stream`; front: leer el stream. Es la mejora que más cambia la sensación de velocidad.
11. **Sugerencias de seguimiento generadas por la IA** — que el back devuelva `{respuesta, sugerencias: [...]}` y el front muestre esas preguntas como chips después de cada respuesta.
12. **Memoria persistente en Neon** — cambiar `InMemorySaver` por el checkpointer de Postgres de LangGraph. Hoy la memoria se pierde en cada reinicio del back y crece sin límite con cada `thread_id`.
13. **Mostrar qué consultó** — "Consulté products y categories" debajo de la respuesta, para que se vea de dónde salen los números.

## Recomendación

1. Primero **1, 2, 3 y 7** como una fase chica del front: lo que más se nota en el uso diario, sin tocar el back.
2. Después **10 y 11**: spec que cruza front y back; encaja con el SDD en la raíz (pausado).

## Otros pendientes

- `remark-breaks` si el agente usa muchos saltos de línea simples (markdown los colapsa dentro de un párrafo).
- Unificar `summarizeInventory` (Inicio) con `summarizeCategories` (Categorías) cuando ambas fases estén en `main`.
- Extraer el patrón de aviso de guardado (status + error que se oculta al editar) a `src/` cuando aparezca por tercera vez.
- `DESIGN-SYSTEM.md` dice `auto-fit` para la grilla de categorías; el canvas y la spec usan `auto-fill`.
- `categories-page.tsx` tiene un espacio no separable literal en el subtítulo; reemplazar por `' '`.
