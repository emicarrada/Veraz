# ADR 0002 — Enriquecimiento IA asíncrono y fuera del path de lectura

## Estado

Aceptado (supersede parcial por ADR 0003 en cuanto a vendor coupling)

## Contexto

Los análisis con modelos de lenguaje son costosos y variables en latencia. El feed y las páginas de noticia deben servir a muchos usuarios concurrentes.

## Decisión

Cuando la IA esté habilitada, precomputar insights de forma asíncrona y servirlos desde la base/cache. Las páginas de lectura no llaman a modelos en request/response.

La IA es **opcional** (ver ADR 0003): si está desactivada, no hay pipeline de enrichment y el producto sigue operando.

## Consecuencias

- Costes predecibles y mejor TTFB/SEO cuando hay enrichment
- Insights pueden ir rezagados respecto a la ingesta
- Se necesita cola/cron y revalidación de cache solo si el Engine está activo
