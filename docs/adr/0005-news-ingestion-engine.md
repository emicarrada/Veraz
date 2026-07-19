# ADR 0005 — News Ingestion Engine desacoplado (Provider Pattern)

## Estado

Propuesto (pendiente de aprobación del producto)

## Contexto

Veraz debe ingerir noticias desde múltiples fuentes (RSS, APIs agregadoras, wires, feeds propios) a escala global, sin depender de un único vendor. El dominio ya define `Article`, `Source` y `Story` como núcleo editorial.

Se necesita un motor de ingesta análogo al AI Engine: contratos estables, adapters aislados, fallo contenido por proveedor.

## Decisión

1. Crear **`src/lib/news-ingestion`** como única puerta a fuentes externas de noticias.
2. Adoptar **Provider Pattern** (`NewsProvider`) con registry configurable.
3. Pipeline por **etapas idempotentes**: discover → fetch → normalize → validate → dedupe → cluster → ready → persist → publish.
4. Modelo interno **`NormalizedArticle`** entre payload crudo y entidades de dominio.
5. **Dedupe** y **Story Engine** como submódulos del Engine, no en features.
6. **Enriquecimiento IA** en cola separada, después de persistencia; fail-open (ADR 0002, 0003).
7. Ejecución **asíncrona** y paralela por Source/provider; circuit breaker por adapter.

## Consecuencias

### Positivas

- Nuevo proveedor = nuevo adapter + registro; sin tocar news/search/admin UI.
- Fallo de Reuters no afecta RSS ni GDELT.
- Camino claro a microservicios por etapa.
- Dominio permanece puro.

### Negativas / coste

- Complejidad operativa (colas, DLQ, observabilidad por provider).
- Necesidad de índices de dedupe y sharding Story a escala.
- Curación editorial para edge cases de clustering.

## Alternativas consideradas

| Alternativa | Por qué se descartó |
|-------------|---------------------|
| Ingesta directa en `features/news` | Acopla UI/CRUD a HTTP/RSS; no escala multi-provider |
| Un solo job RSS monolítico | SPOF por proveedor; imposible agregar APIs sin refactor |
| Normalizar en dominio | Contamina entidades puras con campos vendor-specific |

## Referencias

- [`docs/news-ingestion-engine.md`](../news-ingestion-engine.md)
- [`docs/ai-engine.md`](../ai-engine.md) — patrón análogo
- ADR 0001 (modular monolith), 0002 (async), 0004 (dominio puro)
