# Providers

Concrete adapters live here. **Do not import from `features/` or `app/`.**

Each provider extends `AbstractNewsProvider` and throws `ProviderNotImplementedError` until implemented.

Register explicitly via `ProviderRegistry` at composition root — no auto-registration.
