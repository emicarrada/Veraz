import type { IngestionEngineError } from "@/lib/news-ingestion/errors/base";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";

export function ingestionOk<T>(data: T): IngestionResult<T> {
  return { ok: true, data };
}

export function ingestionFail<T>(
  error: IngestionEngineError,
  retryable?: boolean,
): IngestionResult<T> {
  return {
    ok: false,
    error: error.toPayload(),
    retryable: retryable ?? error.retryable,
  };
}
