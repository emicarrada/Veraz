/**
 * Pipeline processing status for a single ingestion item.
 * Distinct from domain ArticleStatus (publication lifecycle).
 */
export type IngestionPipelineStatus =
  | "discovered"
  | "fetched"
  | "normalized"
  | "validated"
  | "rejected"
  | "deduped"
  | "duplicate"
  | "clustered"
  | "ready"
  | "persisted"
  | "published"
  | "archived"
  | "fetch_failed"
  | "normalize_failed";

export const TERMINAL_PIPELINE_STATUSES = [
  "rejected",
  "duplicate",
  "archived",
] as const satisfies ReadonlyArray<IngestionPipelineStatus>;

export type PipelineState = {
  /** Unique id for this pipeline run / item tracking. */
  runId: string;
  candidateId: string;
  status: IngestionPipelineStatus;
  providerId: string;
  sourceSlug: string;
  updatedAt: string;
  retryCount: number;
  lastError?: PipelineErrorRecord;
};

export type PipelineErrorRecord = {
  code: string;
  message: string;
  stageId?: string;
  retryable: boolean;
  occurredAt: string;
};

export type RetryPolicy = {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableOnly: boolean;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 1_000,
  maxDelayMs: 60_000,
  backoffMultiplier: 2,
  retryableOnly: true,
};
