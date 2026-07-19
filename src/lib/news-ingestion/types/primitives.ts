import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

/** ISO-8601 instant string. */
export type IngestionInstant = string;

/** URL string — normalized at validation/dedupe stages (future). */
export type IngestionUrl = string;
