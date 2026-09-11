# Estrategia SEO + GEO — Veraz

Documento operativo alineado con el plan de indexación agresiva para México/LATAM y motores generativos.

## Objetivo

Convertir Veraz de un producto dependiente de social orgánico a uno **descubrible** por:

- Buscadores tradicionales (Google, Bing)
- Motores generativos (ChatGPT, Perplexity, Google AI Overviews)
- Agregadores RSS y Google Discover

## Implementación técnica (repo)

| Componente | Ubicación |
|------------|-----------|
| Feature SEO | [`src/features/seo/`](../src/features/seo/) |
| robots.txt | [`src/app/robots.ts`](../src/app/robots.ts) |
| sitemap.xml | [`src/app/sitemap.ts`](../src/app/sitemap.ts) |
| Google News sitemap | [`src/app/sitemap-news.xml/route.ts`](../src/app/sitemap-news.xml/route.ts) |
| RSS saliente | [`src/app/[locale]/(app)/noticias/feed.xml/route.ts`](../src/app/[locale]/(app)/noticias/feed.xml/route.ts) |
| llms.txt | [`public/llms.txt`](../public/llms.txt) |
| llms-full.txt | [`src/app/llms-full.txt/route.ts`](../src/app/llms-full.txt/route.ts) |
| IndexNow key | [`src/app/indexnow-key.txt/route.ts`](../src/app/indexnow-key.txt/route.ts) |
| Landing categorías | `/es/noticias/{categoria}` vía [`noticias/[slug]/page.tsx`](../src/app/[locale]/(app)/noticias/[slug]/page.tsx) |
| Página fuentes | [`/es/fuentes`](../src/app/[locale]/(marketing)/fuentes/page.tsx) |

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `GOOGLE_SITE_VERIFICATION` | Meta tag Search Console |
| `BING_SITE_VERIFICATION` | Meta tag Bing Webmaster |
| `YANDEX_SITE_VERIFICATION` | Meta tag Yandex |
| `INDEXNOW_KEY` | Ping Bing/Yandex en artículos nuevos (post-ingesta) |

## Post-deploy (manual)

1. Verificar propiedad en [Google Search Console](https://search.google.com/search-console) (`www.veraz.app`)
2. Enviar sitemap: `https://www.veraz.app/sitemap.xml` y `https://www.veraz.app/sitemap-news.xml`
3. Registrar en [Bing Webmaster Tools](https://www.bing.com/webmasters)
4. Validar Open Graph con Facebook Sharing Debugger y Twitter Card Validator
5. Monitorear cobertura e impresiones por país (MX vs US)

## Señales GEO

- JSON-LD `NewsArticle` con `isBasedOn`, `speakable`, `publisher.logo`
- Bloque **En resumen** machine-readable en artículos
- FAQ en `/es/metodologia`
- `llms.txt` + `llms-full.txt` para crawlers de IA
- Prioridad ES > EN en sitemap

## KPIs (revisión semanal)

| Métrica | Baseline (jul 2026) | Meta 30d | Meta 90d |
|---------|---------------------|----------|----------|
| Organic Search UV | 12 | 40+ | 150+ |
| Páginas indexadas | — | 100+ | 500+ |
| Bounce artículos top | 66% | <55% | <50% |

## Riesgos

- **Thin content:** mitigado con categorías indexables, metodología, fuentes y bloques factuales
- **Hreflang EN:** solo se emite cuando el artículo es accesible en `/en`
- **Google News:** requiere volumen y cadencia; no depender a corto plazo
