# AI Engine — diseño

> Estado: **contratos y configuración por defecto**. Sin proveedores implementados. Sin SDKs. Sin HTTP.

## Propósito

Hacer que Veraz sea **agnóstico al proveedor de IA** y **operable sin IA**.

El Engine es la única capa autorizada a interactuar con modelos (OpenAI, Gemini, Claude, OpenRouter, Ollama, locales, futuros).

## Separación de responsabilidades

| Pieza | Responsabilidad |
|-------|-----------------|
| `features/news` | Publicar y servir noticias (núcleo) |
| `features/ai` | Presentar / solicitar enrichment vía Engine |
| `lib/ai-engine` | Facade, modos, selección de provider, soft-fail |
| `lib/ai-engine/providers/*` | Adapters concretos (vacíos hoy) |

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ features/*   │────▶│   AI Engine     │────▶│ AIProvider impl  │
│ (nunca SDKs) │     │ mode + failOpen │     │ (openai, …)      │
└──────────────┘     └─────────────────┘     └──────────────────┘
```

## Provider Pattern

Interfaz común: `AIProvider` (`src/lib/ai-engine/types/provider.ts`).

- Mismos métodos para todos los backends (`summarize`, `enrichContext`, …).
- Capacidades declaradas por adapter (`supportedCapabilities`).
- La app **no conoce** qué provider está activo; solo el Engine (vía config).

Cambiar proveedor = cambiar `AIEngineConfig.provider` (y credenciales de entorno), no tocar features.

## Modos de funcionamiento

Definidos en `AIMode`:

| Modo | Capacidades habilitadas |
|------|-------------------------|
| **1 · `disabled`** | Ninguna (default) |
| **2 · `summaries`** | `summarize` |
| **3 · `context`** | `summarize` + `context` |
| **4 · `full`** | `summarize`, `context`, `bias`, `reliability`, `timeline`, `related`, `translate` |

El Engine debe rechazar (soft-fail `capability_unavailable`) cualquier capability fuera del modo activo.

## Configuración

```ts
type AIEngineConfig = {
  mode: "disabled" | "summaries" | "context" | "full";
  provider: "none" | "openai" | "gemini" | …;
  failOpen: boolean; // true en publish path
};
```

Default de fábrica (`DEFAULT_AI_ENGINE_CONFIG`):

- `mode: "disabled"`
- `provider: "none"`
- `failOpen: true`

El proyecto arranca sin variables de IA. Las keys de proveedores son opcionales y solo se leen dentro del Engine cuando se implementen adapters.

## Tolerancia a fallos

1. Publicación de noticia **no** espera al Engine.
2. Si el provider lanza o responde error → Engine registra y devuelve `AIResult` con `ok: false`.
3. Features tratan `ok: false` como “sin enrichment”, no como error de producto.
4. Códigos previstos: `disabled`, `provider_unconfigured`, `provider_failure`, `timeout`, etc.

## Resultados

Envelope uniforme:

```ts
type AIResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AIError };
```

Todo enrichment debe incluir trazabilidad a fuentes (`sourceRefs`) cuando `ok: true`.

## Ubicación en el repo

```
src/lib/ai-engine/
  types/       # contratos
  config/      # defaults + getAIEngineConfig()
  providers/   # slots vacíos por vendor
  engine/      # futura implementación del facade
  index.ts     # API pública
  translate.ts # translateArticleContent (fail-open stub)
```

### Traducción de artículos (`translate`)

- Entrada: `@/lib/ai-engine/translate` → `translateArticleContent`.
- Usado por `resolveArticleDisplay` en detalle on-demand; caché en `article_translations`.
- Con `AI_MODE=disabled` o sin runtime de provider: retorna `null` (fail-open).

## Qué está prohibido

- Importar `providers/openai` (u otro) desde `features/` o `app/`
- Bloquear publish por fallo de IA
- Llamar SDKs de IA fuera del Engine
- Asumir que existe API key en runtime
