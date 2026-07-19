# ADR 0003 — AI Engine opcional y agnóstico de proveedor

## Estado

Aceptado

## Contexto

Acoplar Veraz a un único vendor (p. ej. OpenAI) crea un SPOF, obliga a tener API keys para desarrollar, y mezcla el dominio de noticias con infraestructura de modelos.

El núcleo del producto es la plataforma de noticias. La IA solo enriquece.

## Decisión

1. Introducir la capa **AI Engine** (`src/lib/ai-engine`) como única puerta a proveedores.
2. Usar **Provider Pattern** (`AIProvider`) para OpenAI, Gemini, Anthropic, OpenRouter, Ollama, locales y futuros.
3. Modos: `disabled` | `summaries` | `context` | `full` (default: `disabled`).
4. `failOpen`: fallos de IA se registran y no bloquean publicación.
5. Features importan solo `@/lib/ai-engine`, nunca `providers/*` ni SDKs.
6. El proyecto debe arrancar y operar sin ninguna API key de IA.

## Consecuencias

- Desarrollo y deploy del núcleo sin dependencia de vendors de IA
- Cambio de provider por configuración
- Más disciplina de boundaries; implementación del facade/adapters en fases posteriores
- Documentación viva en `docs/ai-engine.md`
