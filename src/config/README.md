# Config Engine

Centralized configuration for Veraz. **No business logic.**

## Rules

1. Only `env/reader.ts` reads `process.env` (one-time snapshot).
2. All modules import from `@/config` — never `process.env` directly.
3. Environments: `development` | `staging` | `production` via `VERAZ_ENV`.
4. Validate at bootstrap with `validateConfig(getConfig())` when wiring startup.

## Domains

| Module | Accessor |
|--------|----------|
| App | `getAppConfig()` |
| AI | `getAIConfig()` |
| News | `getNewsConfig()` |
| Providers | `getProviderConfig()` |
| Cache | `getCacheConfig()` |
| Search | `getSearchConfig()` |
| Premium | `getPremiumConfig()` |
| Security | `getSecurityConfig()` |
| Analytics | `getAnalyticsConfig()` |
| Feature flags | `getFeatureFlags()` |

Root snapshot: `getConfig()` → `VerazConfig`.
