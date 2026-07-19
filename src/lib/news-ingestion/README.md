# News Ingestion Engine

> Contratos y estructura interna. Sin HTTP, sin providers conectados, sin pipeline ejecutable.

Única puerta autorizada a fuentes externas de noticias. Diseño: [`docs/news-ingestion-engine.md`](../../../docs/news-ingestion-engine.md).

## Estado

- Tipos, contratos, errores tipados, registry y providers vacíos implementados.
- Sin lógica de negocio, fetch, cron ni colas.

## Consumo

```ts
import {
  ProviderRegistry,
  type NewsProvider,
  type NormalizedArticle,
} from "@/lib/news-ingestion";
```

**Prohibido** importar `providers/*` concretos desde `features/` o `app/`.
