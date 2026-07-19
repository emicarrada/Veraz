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
| `NEWS_RSS_FEEDS` | JSON del catálogo (16 feeds) |

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
| `primaryVertical` | No | `finance` \| `tech` \| `general` (metadata editorial) |

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

## General (`primaryVertical: general`)

Portadas generales — visibles en **Todas**, no en Finanzas/Tecnología:

| sourceSlug | Fuente | Idioma |
|------------|--------|--------|
| `bbc-mundo` | BBC Mundo | ES |
| `el-pais` | El País | ES |
| `infobae` | Infobae | ES |
| `la-nacion` | La Nación | ES |

## Rutas de producto por rubro

Todo vive en **`/noticias`** con pestañas de clasificación (`?categoria=`):

| Rubro | URL |
|-------|-----|
| Finanzas | `/noticias?categoria=economia` |
| Tecnología | `/noticias?categoria=tecnologia` |
| Todas | `/noticias` |

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
