/**
 * Feature module: AI Insights (product UI + use-cases)
 *
 * Consumes enrichment ONLY through `@/lib/ai-engine`.
 * Must never import provider SDKs or `ai-engine/providers/*`.
 *
 * When the Engine is disabled or soft-fails, this feature degrades
 * gracefully — news remains available without enrichment.
 *
 * Public API surface for this feature.
 * Export only what other features / app routes are allowed to consume.
 * Do not implement business logic in this file.
 */
