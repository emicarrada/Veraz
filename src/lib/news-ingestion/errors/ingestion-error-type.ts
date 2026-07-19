import type {
  IngestionErrorPayload,
  PipelineErrorPayload,
} from "@/lib/news-ingestion/errors/base";

/**
 * Error shape used in IngestionResult envelopes (serializable, not necessarily a thrown Error).
 */
export type IngestionError = IngestionErrorPayload | PipelineErrorPayload;
