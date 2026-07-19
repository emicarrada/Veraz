# Roadmap — Veraz

## Fase 0 — Fundaciones (actual)

- [x] Estructura de carpetas y aliases
- [x] Documentación base
- [x] Reglas de Cursor / estándares
- [x] Design System (tokens, tipografía, UI primitives, layout shells)
- [x] AI Engine — contratos, modos, Provider Pattern (sin proveedores)
- [x] Modelo de dominio (docs + tipos puros en `src/domain`)
- [x] Landing Page oficial (estructura + placeholders + SEO)
- [ ] CI (lint, typecheck)
- [ ] Proyecto Supabase + migraciones iniciales
- [ ] Copy definitivo de marketing
- [ ] Primera composición de producto (feed)

## Fase 1 — MVP (núcleo de noticias, IA opcional)

El MVP debe funcionar **con IA desactivada** (modo `disabled`).

- Ingesta RSS de fuentes curadas
- Modelo `sources` + `articles`
- Feed público (ISR)
- Página de noticia (contenido de fuente; enrichment opcional si Engine activo)
- Categorías básicas
- SEO (metadata, sitemap, OG)
- Auth opcional (login)
- AI Engine: facade runtime + al menos un provider **opcional** (pluggable; no bloquea el MVP)

**Fuera de MVP:** comparación multi-fuente, bias avanzado, favoritos, Premium, search sofisticado.

## Fase 2 — Contexto y confianza (v1)

Requiere Engine en modo `context` o `full` cuando esté habilitado; degradación elegante si está off.

- Clustering por evento / related
- Comparación entre fuentes
- Indicadores de confiabilidad
- Detección de posible sesgo (explicada)
- Timeline del evento
- Búsqueda FTS
- Favoritos

## Fase 3 — Producto y escala (v1.5–v2)

- Veraz Premium
- Search dedicado (p. ej. Meilisearch)
- Workers de ingesta y de enriquecimiento IA **separados**
- Múltiples providers / failover entre vendors
- i18n / fuentes internacionales
- Observabilidad y control de coste de IA (solo cuando Engine activo)

## Fase 4 — Madurez

- Moderación + audit trail (incl. prompts/respuestas cuando IA on)
- APIs públicas / partners
- Compliance (GDPR, retención)
- Evaluación de federación / “bring your source”
- Providers locales (Ollama / self-hosted) como opción first-class

## Criterios de avance

Cada fase debe mantener:

- TypeScript estricto
- Boundaries de features intactos
- Documentación actualizada (`docs/` + ADR si aplica)
- **Núcleo operable con `AIMode = disabled`**
- Ningún feature habla con vendors de IA fuera del AI Engine
- Sin llamadas a IA en el hot path de lectura
- Fallos de IA no bloquean publicación
