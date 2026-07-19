# ADR 0004 — Dominio puro y modelo de noticias escalable

## Estado

Aceptado

## Contexto

Veraz necesita crecer (millones de articles, multi-idioma/país, multi-fuente, Premium, IA opcional) sin rehacer el núcleo. Mezclar entidades con SQL/UI/SDKs acoplaría el producto a decisiones de infraestructura.

## Decisión

1. Mantener un **modelo de dominio explícito** documentado en `docs/domain.md` y tipado en `src/domain` (solo tipos).
2. Separar bounded contexts: catálogo, contenido, agrupación (`Story`), inteligencia opcional, identidad, engagement, premium.
3. Tratar `Article` como agregado raíz publicable **sin** `AIAnalysis`.
4. Introducir `Story` para hechos del mundo real (comparación, timeline, related de calidad).
5. El dominio no depende de infraestructura; los adapters dependen del dominio.

## Consecuencias

- Vocabulario estable para API, DB y features
- Mayor claridad de ownership por feature
- Persistencia y AI Engine se diseñan como adapters, no como “el modelo”
