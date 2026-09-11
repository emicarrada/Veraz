# lib

Infrastructure and low-level helpers.

- `ai-engine/` — optional, provider-agnostic AI layer (contracts only today)
- `postgres/` — pool `pg` + migraciones (`DATABASE_URL`)
- `supabase/` — cliente legado (solo si no hay `DATABASE_URL`)
- `repositories/` — contratos + implementaciones Postgres (y Supabase de fallback)
- `scheduler/` — jobs periódicos de ingesta (desacoplado del pipeline)
- `cache/` — caching helpers (future)

No React components. No product UI.

**Rule:** features must not talk to AI vendors directly — only via `ai-engine`.
