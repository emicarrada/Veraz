# lib

Infrastructure and low-level helpers.

- `ai-engine/` — optional, provider-agnostic AI layer (contracts only today)
- `supabase/` — Supabase admin client + DB types (service role, server-only)
- `repositories/` — contratos + implementaciones Supabase (`Article`, `Source`)
- `scheduler/` — jobs periódicos de ingesta (desacoplado del pipeline)
- `cache/` — caching helpers (future)

No React components. No product UI.

**Rule:** features must not talk to AI vendors directly — only via `ai-engine`.
