# Arquitectura — Veraz

## Resumen

Modular monolith sobre **Next.js App Router**, con lógica de negocio en `src/features/*`, infraestructura en `src/lib/*`, y UI compartida en `src/components/*`.

Deploy: **Vercel**. Datos y auth: **Supabase (PostgreSQL + Auth)**.

**Núcleo del producto:** plataforma de noticias (ingesta, publicación, lectura).  
**IA:** capa opcional (`AI Engine`) que *enriquece* contenido. Veraz debe funcionar al 100% **sin ningún proveedor de IA ni API keys**.

## Diagrama lógico

```
Client (RSC / Client Components)
        │
App Router (src/app) — routing, layouts, Route Handlers
        │
Features (src/features) — news, search, auth, … (+ ai insights UI)
        │
        ├── lib/supabase, cache, …     (infra del núcleo)
        │
        ├── lib/news-ingestion  ← ÚNICA puerta a fuentes externas de noticias
        │        │
        │        ├── providers/rss|newsapi|gdelt|guardian|…  (futuro)
        │        └── pipeline: discover → … → publish
        │
        └── lib/ai-engine  ← ÚNICA puerta a proveedores de IA
                 │
                 ├── providers/openai|gemini|anthropic|…  (futuro)
                 └── mode: disabled | summaries | context | full
        │
PostgreSQL (Supabase) + Auth + jobs de ingesta
        │
   [opcional] jobs de enriquecimiento vía AI Engine
```

## Capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| Presentation / routing | `src/app` | Rutas, layouts, metadata SEO |
| Shared UI | `src/components` | Design system y layout |
| **Domain** | `src/domain` | Entidades, VOs, enums — **puro**, sin infra |
| Features | `src/features/<name>` | Use-cases, UI de módulo, mapping a dominio |
| Cross-cutting services | `src/services` | Orquestación compartida (mínima) |
| **News Ingestion Engine** | `src/lib/news-ingestion` | Única capa que habla con RSS/APIs de noticias |
| **AI Engine** | `src/lib/ai-engine` | Única capa que habla con modelos de IA |
| Infrastructure | `src/lib` | Supabase, cache, adapters de persistencia |
| **Config Engine** | `src/config` | Configuración centralizada; única capa que lee `process.env` |

### Regla de dependencia (dominio)

```
UI / app  →  features / services  →  domain  ←  infrastructure
                              ↘
                    news-ingestion (ingesta; mapping a Article/Story)
                              ↘
                           ai-engine (opcional; mapping a AIAnalysis)
```

El dominio **nunca** importa React, Supabase, HTTP, RSS, APIs de noticias ni providers de IA.  
Detalle del modelo: [`docs/domain.md`](./domain.md).

## Modelo de dominio (resumen)

**Núcleo:** `Source` → `Article` (+ `Media`, `Reference`, taxonomías `Category` / `Topic` / `Tag`, `Country`, `Language`).

**Agrupación:** `Story` (hecho real) + `TimelineEvent` + `RelatedArticle`.

**Opcional:** `AIAnalysis` (satélite; 0..N).

**Usuario:** `UserProfile`, `UserPreference`, `Bookmark`, `Notification`, `PremiumPlan`, `PremiumSubscription`.

Invariante clave: **publicar/leer Article no requiere IA ni Premium.**


## Filosofía: IA opcional

1. La noticia es independiente de la IA. Publicar **nunca** espera a un modelo.
2. Si la IA está desactivada, falla o no hay API key → la plataforma sigue operando (feed, detalle, búsqueda, etc.).
3. El enriquecimiento (resumen, contexto, sesgo, …) es best-effort y asíncrono.
4. Ningún feature importa SDKs de OpenAI/Gemini/Claude/etc. Solo `@/lib/ai-engine`.
5. Cambiar de proveedor = cambiar configuración, no reescribir features.

Detalle: [`docs/ai-engine.md`](./ai-engine.md).

## AI Engine (Provider Pattern)

```
Feature (news / ai)
        │  solo contratos públicos
        ▼
   AIEngine (facade)
        │  selecciona adapter por config
        ▼
   AIProvider (interfaz común)
        │
   openai | gemini | anthropic | openrouter | ollama | local | …
```

### Modos

| Modo | Comportamiento |
|------|----------------|
| `disabled` | Sin llamadas a IA. Default de fábrica. |
| `summaries` | Solo resúmenes objetivos. |
| `context` | Resúmenes + contexto. |
| `full` | Todas las capacidades configuradas. |

### Tolerancia a fallos

- `failOpen: true` en el path de publicación.
- Errores de proveedor → log + `AIResult` soft-fail → la noticia se publica igual.
- La IA **no** es un SPOF.

### Estado actual

Solo **contratos TypeScript**, config default (`disabled` / `none`) y slots vacíos de providers.  
Sin SDKs, sin HTTP, sin implementaciones de proveedores.

## News Ingestion Engine (Provider Pattern)

Motor desacoplado para obtener noticias desde **múltiples proveedores** sin depender de uno solo. Diseño completo: [`docs/news-ingestion-engine.md`](./news-ingestion-engine.md).

```
Scheduler / admin trigger
        │
        ▼
   IngestionEngine (facade)
        │
        ├── por Source → NewsProvider (interfaz común)
        │                      │
        │            rss | newsapi | gdelt | google-news
        │            guardian | reuters | ap-news | custom
        │
        └── pipeline por etapas (idempotente, async)
                 │
                 discover → fetch → normalize → validate
                 → dedupe → cluster (Story) → ready
                 → persist → publish
                 │
                 └── [opcional, cola aparte] AI Engine
```

### Etapas del pipeline

| Etapa | Responsabilidad |
|-------|-----------------|
| Descubrimiento | Listar candidatos (`IngestionCandidate`) por Source |
| Obtención | Traer payload crudo del proveedor |
| Normalización | `ProviderPayload` → `NormalizedArticle` (modelo interno único) |
| Validación | Reglas, campos obligatorios, política de Source |
| Dedupe | Detectar repetidos (URL, fingerprint, similitud) |
| Story Engine | Agrupar cobertura multi-fuente del mismo hecho |
| Enriquecimiento | Opcional vía AI Engine; **no bloquea** publish |
| Persistencia | Map → `Article`, `Media`, `Reference`, `Story`, … |
| Publicación | `Article.status: published` + invalidación cache |

### Tolerancia a fallos (ingesta)

- Fallo de **un proveedor** no detiene otros workers ni Sources.
- Fallo de **un ítem** no aborta el batch.
- Circuit breaker y DLQ por provider/ítem.
- Errores → eventos de observabilidad; sin impacto en lectura pública.

### Estado actual

**Implementado en código (`src/lib/news-ingestion/`):**

| Área | Estado |
|------|--------|
| Tipos (`NormalizedArticle`, `IngestionCandidate`, `ProviderPayload`, …) | ✓ contratos |
| Errores tipados (`IngestionEngineError` hierarchy) | ✓ |
| `NewsProvider` + `AbstractNewsProvider` | ✓ |
| **`RSSProvider` funcional** (fetch XML → parse → normalize) | ✓ |
| `RssFeedFetcher`, `RssXmlParser`, `RssNormalizer` | ✓ |
| `RssIngestionRunner` (discover → fetch → normalize) | ✓ |
| **`Persistencia RSS → Supabase`** (mapper + repos + idempotencia) | ✓ |
| `RssIngestionPersistenceRunner` | ✓ |
| `ArticleRepository`, `SourceRepository` (Supabase) | ✓ |
| Otros providers (NewsAPI, GDELT, …) | slots vacíos |
| `ProviderRegistry` (register / get / list) | ✓ sin auto-registro |
| Contratos pipeline (validate, dedupe, story, publish) | ✓ sin lógica |
| Unit tests (parser, normalizer, provider, mapper, repos) | ✓ vitest |

**Pendiente:** cron, colas, dedupe/story algoritmos, otros providers.

| **Detalle `/noticias/[slug]`** | ✓ SSR + SEO + JSON-LD |
| **Scheduler + cron jobs** | ✓ discover / run / health |

| **Feed público `/noticias`** | ✓ SSR + load more |

RSS feed URLs: `NEWS_RSS_FEEDS` en Config Engine (`getRssFeedBySourceSlug`).

Detalle: [`docs/news-ingestion-engine.md`](./news-ingestion-engine.md) · ADR 0005.

## Config Engine

Configuración centralizada para toda la aplicación. **Ningún módulo** fuera de `src/config/env/` lee `process.env` directamente.

```
process.env  →  config/env/reader (snapshot único)
                      │
                      ▼
                 build-config.ts (mapeo + defaults)
                      │
                      ▼
                 VerazConfig  →  getAppConfig(), getAIConfig(), …
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   lib/ai-engine  lib/news-ingestion  app / features
```

### Entornos

| Perfil | Resolución |
|--------|------------|
| `development` | Default; `VERAZ_ENV=development` o ausente en dev |
| `staging` | `VERAZ_ENV=staging` |
| `production` | `VERAZ_ENV=production` o `NODE_ENV=production` |

### Dominios de configuración

| Dominio | Accessor | Contenido |
|---------|----------|-----------|
| App | `getAppConfig()` | nombre, siteUrl, environment |
| AI | `getAIConfig()` | `AIEngineConfig` + credential env key |
| News | `getNewsConfig()` | ingesta (flags futuros) |
| Providers | `getProviderConfig()` | slots AI + news (declarativo) |
| Cache | `getCacheConfig()` | TTL / revalidate |
| Search | `getSearchConfig()` | backend, page size |
| Premium | `getPremiumConfig()` | billing provider |
| Security | `getSecurityConfig()` | cron auth, service role |
| Analytics | `getAnalyticsConfig()` | provider id |
| Feature flags | `getFeatureFlags()` | IA, premium, timeline, … |

Raíz: `getConfig()` → `VerazConfig`.

### Feature flags

`FF_AI`, `FF_PREMIUM`, `FF_NEWS_COMPARISON`, `FF_TIMELINE`, `FF_ADVANCED_SEARCH`, `FF_NOTIFICATIONS`, `FF_MAINTENANCE_MODE` — defaults seguros (mayoría `false`).

### Validación

`validateConfig(getConfig())` al bootstrap — validadores mínimos incluidos; registro extensible `CONFIG_VALIDATORS` para Zod/reglas futuras.

### Estado actual

Implementado: tipos, env reader, builders, accessors, feature flags, provider slots declarativos, validación bootstrap básica.  
Pendiente: validadores Zod, wiring Supabase/cron, secret resolution en runtime.

## Design System

Fuente de verdad visual centralizada. Un cambio en tokens debe propagarse a toda la UI.

### Organización

| Ruta | Rol |
|------|-----|
| `src/styles/tokens.css` | Variables CSS (color, espacio, radio, sombra, z-index, motion, layout) |
| `src/styles/fonts.css` | `@font-face` (Helvetica Now Display / Veraz Sans) |
| `src/styles/typography.css` | Estilos tipográficos (`.text-display` … `.text-label`) |
| `src/styles/globals.css` | Base, focus-visible, imports |
| `tailwind.config.ts` | Mapeo de tokens → utilidades Tailwind |
| `src/components/ui/*` | Primitivos reutilizables |
| `src/components/layout/*` | Shells (Header, Footer, Sidebar, MobileNav, ThemeProvider) |

### Principios

1. **Tokens primero** — no hardcodear hex/px en componentes; usar clases tokenizadas.
2. **Composición** — layouts reciben slots; no conocen features.
3. **Sin lógica de negocio** — el design system no llama APIs ni conoce dominio.
4. **Accesibilidad AA** — `aria-*`, focus visible, teclado en overlays.
5. **Tema** — `ThemeProvider` + `data-theme`; **dark es el default** del producto.

### Consumo

```ts
import { Button, Card, Text } from "@/components/ui";
import { Header, Footer, ThemeProvider } from "@/components/layout";
```

## Landing Page (marketing)

Ruta: `/` vía `src/app/(marketing)/page.tsx`.

### Organización

| Pieza | Ubicación |
|-------|-----------|
| Página + metadata SEO | `src/app/(marketing)/page.tsx` |
| Composición | `src/components/marketing/landing/landing-page.tsx` |
| Secciones | `src/components/marketing/landing/*-section.tsx` |
| Header/Footer marketing | `landing-header.tsx` (`PillNav` mobile-first), `landing-footer.tsx` |
| PillNav | `src/components/ui/pill-nav` (GSAP) |
| Motion sutil | `src/styles/landing.css` + PillNav |

### Secciones (orden)

1. Hero (brand-first, full-bleed)
2. ¿Qué es Veraz?
3. Cómo funciona
4. Características principales
5. Categorías de noticias
6. Beneficios
7. CTA final
8. Footer

### Reglas de la landing

- Solo Design System (`components/ui`, `components/layout`) + secciones marketing.
- Copy con placeholders `[PLACEHOLDER: …]` hasta definición editorial.
- Sin formularios conectados, APIs, auth, feed ni IA.
- SEO: Metadata API, Open Graph, Twitter Cards, JSON-LD (`Organization` + `WebSite`).
- Animaciones CSS mínimas con `prefers-reduced-motion`.

## Features planificadas

| Feature | Rol |
|---------|-----|
| `news` | Artículos, feed, detalle, categorías (**núcleo**) |
| `ai` | UI/use-cases de insights; consume solo AI Engine |
| `search` | Búsqueda y filtros |
| `auth` | Sesión y guards |
| `profile` | Perfil y preferencias |
| `premium` | Planes y paywall |
| `settings` | Ajustes (incl. preferencias de enriquecimiento) |
| `admin` | Operación, moderación, fuentes, DLQ ingesta |

## Reglas de dependencia

1. `app/` no contiene lógica de negocio; orquesta features.
2. Un feature no importa internals de otro; solo su `index.ts`.
3. `lib/` no importa React ni features.
4. `domain/` no importa `lib/`, `features/`, `components/` ni `app/`.
5. Componentes en `components/` no conocen detalles de un solo feature.
6. Lectura pública: cache/ISR. Ingesta: jobs asíncronos vía News Ingestion Engine.
7. Enriquecimiento IA: jobs opcionales vía AI Engine (cola separada de ingesta).
8. **Prohibido** importar `src/lib/ai-engine/providers/*` desde fuera del AI Engine.
9. **Prohibido** importar `src/lib/news-ingestion/providers/*` desde fuera del Ingestion Engine.
10. **Prohibido** acoplar el publish path a la disponibilidad de un proveedor de IA **o de noticias**.
11. **Prohibido** leer `process.env` fuera de `src/config/env/` — usar `@/config`.
12. Infraestructura adapta al dominio (repositorios), no al revés.

## Decisiones clave

Ver también `docs/adr/`.

- Modelo de dominio explícito y puro (`src/domain`, ADR 0004)
- Núcleo = noticias; IA = enriquecimiento opcional (ADR 0003)
- News Ingestion Engine multi-proveedor; Provider Pattern (ADR 0005)
- `Story` como cluster de hecho real (multi-fuente / timeline)
- Provider Pattern vía AI Engine; app agnóstica al vendor de IA
- Ingesta y enrichment en colas separadas; ambas async (ADR 0002)
- IA asíncrona / fuera del hot path de lectura cuando esté activa
- RLS en Supabase para datos de usuario
- TypeScript `strict` sin `any`
- FTS en Postgres en MVP; search engine dedicado más adelante
- Design tokens centralizados en CSS variables

## Escalabilidad

1. CDN + ISR / `revalidateTag` para feed y detalle
2. Read models desnormalizados cuando el listado lo exija
3. **Cola de ingesta** (News Ingestion Engine) independiente de la cola de enriquecimiento IA
4. Particionado por `Source`, `providerId`, país e idioma; workers paralelos
5. Dedupe y Story clustering con índices dedicados a escala de millones de artículos
6. Extraer workers de ingesta por etapa solo cuando coste o carga lo justifique
