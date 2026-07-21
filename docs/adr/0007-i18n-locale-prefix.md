# ADR 0007: i18n con prefijo de locale ES/EN

## Estado

Aceptado — 2026-07-21

## Contexto

Veraz necesita servir la UI en español e inglés con URLs explícitas (`/es`, `/en`), selector de idioma en la navegación principal, y traducción de artículos como capa de lectura sin alterar la ingesta RSS.

## Decisión

1. **Routing:** `next-intl` con `localePrefix: 'always'`, locales `es` (default) y `en`.
2. **App Router:** rutas bajo `src/app/[locale]/`; middleware unificado con guard de cron existente.
3. **UI:** catálogos `messages/es.json` y `messages/en.json`; componentes usan `getTranslations` / `useTranslations`.
4. **PillNav:** slot `trailing` con `LocaleSwitcher` (ES | EN), preservando pathname al cambiar idioma.
5. **Artículos:** tabla `article_translations` en Supabase como caché; `resolveArticleDisplay` fail-open (original + nota de idioma si no hay traducción).
6. **IA:** capability `translate` en AI Engine; stub fail-open hasta conectar provider runtime (ADR 0003).
7. **Feed por locale:** `/es/noticias` Todas = mixto ES+EN; `/en/noticias` = solo artículos en inglés. Pestañas Finanzas/Tecnología usan fuentes prestigiosas distintas por locale (ES+EN en `/es`, solo EN en `/en`). Transparencia editorial en `/es` Finanzas/Tecnología cuando fuentes publican en inglés.

## Consecuencias

- URLs canónicas y `hreflang` por locale en metadata.
- Slug de artículo global; prefijo de locale distingue versión lingüística.
- Traducción on-demand en detalle (no en ingesta); feed usa solo caché batch.
- Middleware excluye `/api/cron/*` del matcher i18n vía early return.
- Ingesta asigna idioma desde catálogo RSS (`defaultLanguageCode`) cuando el feed no publica `<language>`.

## Alternativas consideradas

- **Subdominios (`en.veraz.app`):** más complejo en DNS/cookies; rechazado.
- **Traducir en ingesta:** coste y riesgo editorial; rechazado (capa de lectura preferida).
