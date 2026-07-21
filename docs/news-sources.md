# Catálogo de fuentes RSS — Veraz

Fuentes curadas para ingesta vía `NEWS_RSS_FEEDS`. Mezcla **español + inglés** (mercado global). Preferimos **feeds de sección** sobre portadas generales.

La fuente de verdad en código es [`src/config/domains/rss-feed-catalog.ts`](../src/config/domains/rss-feed-catalog.ts).

Las pestañas **Finanzas** y **Tecnología** en `/noticias` solo muestran artículos de fuentes de referencia definidas en [`src/features/news/config/prestigious-sources.ts`](../src/features/news/config/prestigious-sources.ts). Infobae, La Nación y medios generales aparecen solo en **Todas**.

## Cómo activar

1. Copia el JSON de `.env.example` o del catálogo a `.env.local`:
   ```bash
   NEWS_INGESTION_ENABLED=true
   NEWS_RSS_FEEDS=[...]
   ```
2. Valida feeds: `npm run feeds:validate`
3. Descubre ítems: `npm run ingest:discover`
4. Ingesta completa: `npm run ingest:run`
5. Sincroniza a Vercel: `npm run sync:vercel-env`

## Producción (Vercel Hobby + GitHub Actions)

El hosting queda en **Vercel**; la ingesta programada corre en **GitHub Actions** (scripts CLI contra Supabase de prod). Vercel Hobby no permite crons frecuentes, así que `vercel.json` no define crons automáticos.

### Secrets en GitHub

En **Settings → Secrets and variables → Actions** del repo, o con el script:

```bash
./scripts/sync-github-secrets.sh
```

| Secret | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (ingesta) |
| `NEWS_RSS_FEEDS` | JSON del catálogo (22 feeds) |

### Workflows (`.github/workflows/`)

| Workflow | Schedule | Job |
|----------|----------|-----|
| `ingest-health.yml` | cada 5 min | `health_check` |
| `ingest-discover.yml` | cada 15 min | `discover_feeds` |
| `ingest-run.yml` | :05, :20, :35, :50 | `run_ingestion` |

Disparo manual: pestaña **Actions** → workflow → **Run workflow**.

Las rutas `/api/cron/ingest/*` en Vercel siguen disponibles para debug con `CRON_SECRET`, pero no son el scheduler principal.

## Campos por fuente

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `sourceSlug` | Sí | Identificador único (kebab-case) |
| `feedUrl` | Sí | URL RSS/Atom |
| `defaultLanguageCode` | No | `es`, `en`, `pt`, `fr`, `de` (tabla `languages`) |
| `defaultTopicGroup` | No | Fallback si el clasificador devuelve `general` |
| `primaryVertical` | No | `finance` \| `tech` \| `sports` \| `culture` \| `general` (metadata editorial) |

## Finanzas — fuentes de referencia (`primaryVertical: finance`)

Solo estas fuentes alimentan la pestaña Finanzas (y sub-temas Mercados / Criptomonedas):

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `cnbc-top` | CNBC | EN |
| `marketwatch` | MarketWatch | EN |
| `bloomberg-linea` | Bloomberg Línea | ES |
| `expansion` | Expansión | ES |
| `el-pais-economia` | El País Economía | ES |

## Tecnología — fuentes de referencia (`primaryVertical: tech`)

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `techcrunch` | TechCrunch | EN |
| `the-verge` | The Verge | EN |
| `ars-technica` | Ars Technica | EN |
| `wired` | Wired | EN |
| `mit-tech-review` | MIT Technology Review | EN |
| `engadget` | Engadget | EN |
| `el-pais-tecnologia` | El País Tecnología | ES |

## Deportes — fuentes EN (`primaryVertical: sports`, solo `/en`)

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `bbc-sport` | BBC Sport | EN |
| `guardian-sport` | The Guardian Sport | EN |
| `espn-top` | ESPN Top Headlines | EN |

## Cultura / entretenimiento — fuentes EN (`primaryVertical: culture`, solo `/en`)

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `bbc-entertainment` | BBC Entertainment & Arts | EN |
| `guardian-culture` | The Guardian Culture | EN |
| `variety` | Variety | EN |

## General (`primaryVertical: general`)

Portadas generales — visibles en **Todas**, no en Finanzas/Tecnología:

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `bbc-mundo` | BBC Mundo | ES |
| `el-pais` | El País | ES |
| `infobae` | Infobae | ES |
| `la-nacion` | La Nación | ES |

## Rutas de producto por rubro

Todo vive en **`/noticias`** con pestañas de clasificación (`?categoria=`). Con i18n, las rutas llevan prefijo de locale:

| Rubro | URL (ES) | URL (EN) |
|-------|----------|----------|
| Finanzas | `/es/noticias?categoria=economia` | `/en/noticias?categoria=economia` |
| Tecnología | `/es/noticias?categoria=tecnologia` | `/en/noticias?categoria=tecnologia` |
| Todas | `/es/noticias` | `/en/noticias` |

### Política de idioma por locale

| Ruta | Comportamiento |
|------|----------------|
| `/es/noticias` (Todas) | Solo fuentes ES del catálogo y artículos en español |
| `/en/noticias` (Todas) | Solo fuentes EN del catálogo y artículos en inglés |
| `/es/noticias?categoria=economia\|tecnologia` | Fuentes prestigiosas ES+EN (mixto); aviso de idioma en UI |
| `/es/noticias?categoria=deportes\|cultura\|…` | Solo fuentes ES y artículos en español |
| `/en/noticias?categoria=economia\|tecnologia` | Solo fuentes prestigiosas EN |
| `/en/noticias/[slug]` (detalle) | 404 si el artículo no cumple la política EN |
| `/es/noticias/[slug]` (detalle) | 404 salvo fuente ES en español o fuente EN de referencia en finanzas/tech |

En `/es` Finanzas/Tecnología se muestra un aviso de transparencia cuando varias fuentes de referencia publican en inglés.

## Feed vacío — diagnóstico

Si `/es/noticias` o `/en/noticias` no muestran artículos:

1. **Migraciones:** aplicar todas las migraciones en `supabase/migrations/` (incl. `article_translations` y catálogo `languages`).
2. **Diagnóstico:** `npm run diagnose:feed` — cuenta artículos visibles, joins rotos de `language_id`, fuentes prestigiosas en DB y existencia de `article_translations`.
3. **Ingesta:** `npm run ingest:discover` y luego `npm run ingest:run`.
4. **Idioma EN en `/en`:** si artículos existían antes del fix de ingesta, ejecutar una vez `npm run backfill:language` para recalcular `language_id` desde el catálogo/fuente.
5. **Variables:** confirmar `NEWS_INGESTION_ENABLED=true` y `NEWS_RSS_FEEDS` en el entorno que ejecuta la ingesta.

Causa habitual post-i18n: artículos con `language_id` huérfano (excluidos por inner join) o artículos EN mal etiquetados como `es` (filtro de `/en` los oculta hasta backfill).

## Fuentes evaluadas pero no incluidas

| Fuente | Motivo |
|--------|--------|
| Reuters Business RSS | Feed legacy caído / bloqueado |
| El Economista (MX) | HTTP 403 en RSS público |
| Xataka, Genbeta, Hipertextual | Blogs — no entran en pestaña Tecnología (referencia global) |
| Ámbito Financiero | Medio regional — excluido de Finanzas de referencia |

## Monitoreo

- `RunIngestionJob` registra resultados por `sourceSlug` en logs.
- `npm run feeds:validate` — smoke test de HTTP 200 + ≥1 ítem parseable.
