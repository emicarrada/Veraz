# AI Engine

Optional, provider-agnostic layer for AI enrichment.

## Rules

1. **This folder is the only place** allowed to talk to AI providers (OpenAI, Gemini, Claude, Ollama, …).
2. Features (`src/features/*`) and app routes must import from `@/lib/ai-engine` only — never from `providers/<id>`.
3. Default config is **disabled** (`mode: "disabled"`, `provider: "none"`). The app runs with zero AI keys.
4. Provider failures are **soft-fail**: log + skip enrichment; never block publishing.
5. No HTTP clients or SDKs are wired yet — only contracts and config defaults.

## Layout

```
ai-engine/
  types/        # contracts (provider, engine, results, errors, modes)
  config/       # AIEngineConfig + disabled defaults
  providers/    # future adapters (empty slots today)
  engine/       # future facade implementation
  index.ts      # public API
```

## Modes

| Mode | Capabilities |
|------|----------------|
| `disabled` | none |
| `summaries` | summarize |
| `context` | summarize + context |
| `full` | all capabilities |

See `docs/ai-engine.md` and `docs/architecture.md`.
