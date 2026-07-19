import type { IngestionError } from "@/lib/news-ingestion/errors/ingestion-error-type";
import type {
  DiscoverOutput,
  FetchOutput,
} from "@/lib/news-ingestion/types/article";

/**
 * Uniform result envelope for provider and stage operations.
 */
export type IngestionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: IngestionError; retryable: boolean };

export type DiscoverResult = IngestionResult<DiscoverOutput>;

export type FetchResult = IngestionResult<FetchOutput>;
