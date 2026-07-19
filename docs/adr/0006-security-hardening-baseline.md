# ADR 0006 — Security hardening baseline (sin auth)

## Estado

Aceptado

## Contexto

Veraz es un modular monolith Next.js en Vercel con Supabase y ingesta RSS vía GitHub Actions. La documentación (`docs/api.md`, `docs/database.md`) asumía RLS, rate limiting y validación en boundaries, pero la implementación estaba incompleta. No hay auth de usuarios aún.

Amenazas prioritarias: exposición de service role, trigger no autorizado de ingesta, contenido RSS malicioso, SSRF vía URLs, info disclosure en cron.

## Decisión

1. **RLS read-only público** en tablas de contenido — anon solo `SELECT` de filas publicadas/activas; writes vía service role.
2. **Security headers globales** en `next.config.ts`; CSP en modo report-only inicialmente.
3. **Cron auth endurecido** — comparación timing-safe, rate limit in-memory, logs sin secrets.
4. **Build fail closed** — producción sin `CRON_SECRET` o `SUPABASE_SERVICE_ROLE_KEY` falla en `prebuild`.
5. **Ingesta hardened** — max bytes en fetch RSS, límite de items, validate stage con anti-SSRF y policy URLs.
6. **CI security** — workflow con `npm audit --audit-level=high`.
7. **Documentación** — `docs/security.md` + este ADR.

Auth de usuarios, CSRF y API pública quedan para Fase B (MVP).

## Consecuencias

### Positivas

- Anon key segura si se usa en cliente más adelante.
- Cron debug en Vercel no trivialmente abusable.
- Ingesta trata RSS como input hostil.
- Decisiones trazables para auditoría futura.

### Negativas / coste

- Rate limit in-memory no coordina entre instancias serverless (suficiente para 3 rutas cron de debug).
- CSP report-only no bloquea XSS aún — migración gradual a enforce.
- Validate stage puede rechazar edge cases de feeds legítimos (ajustar límites si ocurre).

## Alternativas consideradas

| Alternativa | Por qué no ahora |
|-------------|------------------|
| WAF / Cloudflare | Coste y complejidad; Vercel + headers suficientes en esta fase |
| Upstash rate limit | Overkill para 3 rutas cron; reservado para API pública |
| Parser XML completo | Regex actual + límites; migrar si ReDoS en prod |

## Referencias

- `docs/security.md`
- `src/lib/scheduler/auth/verify-cron-auth.ts`
- `supabase/migrations/*_enable_rls_public_read.sql`
