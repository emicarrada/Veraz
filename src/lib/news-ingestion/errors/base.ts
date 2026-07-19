import type {
  IngestionErrorCode,
  PipelineErrorCode,
  PipelineStageId,
} from "@/lib/news-ingestion/errors/codes";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

/**
 * Serializable error payload for IngestionResult envelopes.
 */
export type IngestionErrorPayload = {
  code: IngestionErrorCode;
  message: string;
  providerId?: NewsProviderId;
  stageId?: PipelineStageId;
  retryable: boolean;
  cause?: unknown;
};

export type PipelineErrorPayload = {
  code: PipelineErrorCode;
  message: string;
  stageId: PipelineStageId;
  providerId?: NewsProviderId;
  retryable: boolean;
  cause?: unknown;
};

/**
 * Base class for all News Ingestion Engine errors.
 * Do not throw generic Error from this module.
 */
export abstract class IngestionEngineError extends Error {
  abstract readonly code: IngestionErrorCode | PipelineErrorCode;

  readonly providerId?: NewsProviderId;
  readonly stageId?: PipelineStageId;
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor(
    message: string,
    options?: {
      providerId?: NewsProviderId;
      stageId?: PipelineStageId;
      retryable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = new.target.name;
    this.providerId = options?.providerId;
    this.stageId = options?.stageId;
    this.retryable = options?.retryable ?? false;
    this.cause = options?.cause;
  }

  abstract toPayload(): IngestionErrorPayload | PipelineErrorPayload;
}
