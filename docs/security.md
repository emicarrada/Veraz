# Security — Veraz

> Estado: **hardening baseline** (sin auth de usuarios). Auth y datos personales: Fase B (MVP).

## Principios

1. **Fail closed en producción** — secrets críticos ausentes bloquean el build.
2. **Lectura pública intacta** — el feed no depende de auth ni de IA.
3. **Service role solo server-side** — nunca en bundle cliente ni logs.
4. **Ingesta = frontera de confianza** — RSS y URLs externas son input no confiable.
5. **Trazabilidad** — decisiones en ADR; cambios de postura actualizan este doc.

## Superficies de ataque (producto actual)

| Superficie | Exposición | Controles |
|------------|------------|-----------|
| Páginas públicas (SSR/ISR) | Internet | Security headers, XSS mitigado (texto React) |
| `/api/cron/ingest/*` | Internet (debug Vercel) | `CRON_SECRET`, rate limit, timing-safe compare |
| GitHub Actions ingesta | CI secrets | `service_role`, permisos mínimos |
| Supabase | Anon + service role | RLS read-only público; writes solo service role |
| RSS externos | Saliente (ingesta) | Timeout, max bytes, validate stage, URL policy |

## Secrets

| Variable | Exposición | Uso |
|----------|------------|-----|
| `SUPABASE_SERVICE_ROLE_KEY` | Server / CI only | Repositorios, ingesta |
| `CRON_SECRET` | Server only | Rutas cron HTTP |
| `NEXT_PUBLIC_SUPABASE_*` | Cliente (futuro) | Anon key — requiere RLS |
| AI provider keys | Server only | AI Engine (opcional) |

Rotación recomendada: cada 90 días o ante sospecha de fuga. Procedimiento:

1. Generar nuevo secret (`openssl rand -hex 32` para `CRON_SECRET`).
2. Actualizar Vercel env + `.env.local`.
3. Rotar service role en Supabase Dashboard → API → service_role key.
4. `./scripts/sync-vercel-env.sh` y `./scripts/sync-github-secrets.sh`.

## Row Level Security (Supabase)

- **Contenido público:** `SELECT` solo para filas publicadas/activas (rol `anon` / `authenticated`).
- **Escritura:** exclusivamente `service_role` (bypass RLS).
- **Fase B (auth):** tablas de usuario con `auth.uid()` — ver `docs/database.md`.

## Cron HTTP

- Auth: `Authorization: Bearer <CRON_SECRET>` o header `x-cron-secret`.
- Solo `development` omite auth (local).
- Staging y production requieren secret.
- Rate limit: 10 req/min por IP en `/api/cron/*`.
- Scheduler principal: GitHub Actions CLI (no HTTP).

## Ingesta RSS

- Max body: 2 MB por feed.
- Timeout: 15 s.
- Max items parseados: 100 por feed.
- Validate stage: URLs http(s) públicas, límites de campo, policy `/live/`.
- HTML strip antes de persistir.

## Security headers

Configurados en `next.config.ts`: HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, CSP report-only.

## Runbook — incidentes

### Sospecha de fuga de `CRON_SECRET`

1. Rotar secret en Vercel (ver arriba).
2. Revisar logs Vercel de `/api/cron/*` (401 vs 200).
3. Confirmar que ingesta GitHub Actions sigue operando (no usa HTTP cron).

### Sospecha de fuga de `SUPABASE_SERVICE_ROLE_KEY`

1. Rotar key en Supabase inmediatamente.
2. Actualizar Vercel + GitHub secrets.
3. Auditar filas recientes en `articles` / `sources` por anomalías.

### Contenido malicioso en feed

1. Pausar source en DB (`status = 'paused'`) o quitar feed de `NEWS_RSS_FEEDS`.
2. Revisar artículo por ID/slug; `status = 'unpublished'` si aplica.
3. Ampliar `feed-url-policy` si el patrón es recurrente.

## Fase B (fuera de alcance actual)

- Supabase Auth, CSRF en Server Actions
- RLS `auth.uid()` para bookmarks/preferences
- API pública versionada + JWT
- WAF / pentest / GDPR formal

Ver ADR [0006](./adr/0006-security-hardening-baseline.md).
