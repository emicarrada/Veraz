import {
  IngestionEngineError,
  type IngestionErrorPayload,
  type PipelineErrorPayload,
} from "@/lib/news-ingestion/errors/base";
import type {
  PipelineErrorCode,
  PipelineStageId,
} from "@/lib/news-ingestion/errors/codes";
import type { NewsProviderId } from "@/lib/news-ingestion/types/provider-id";

abstract class PipelineStageError extends IngestionEngineError {
  override readonly stageId: PipelineStageId;
  abstract override readonly code: PipelineErrorCode;

  constructor(
    stageId: PipelineStageId,
    message: string,
    options?: {
      providerId?: NewsProviderId;
      retryable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message, { ...options, stageId });
    this.stageId = stageId;
  }

  toPayload(): PipelineErrorPayload {
    return {
      code: this.code,
      message: this.message,
      stageId: this.stageId,
      providerId: this.providerId,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}

export class StageNotImplementedError extends PipelineStageError {
  override readonly code = "stage_not_implemented" as const;

  constructor(stageId: PipelineStageId) {
    super(stageId, `Pipeline stage "${stageId}" is not implemented.`);
  }
}

export class StageInputInvalidError extends PipelineStageError {
  override readonly code = "stage_input_invalid" as const;

  constructor(stageId: PipelineStageId, detail?: string) {
    super(stageId, detail ?? `Invalid input for stage "${stageId}".`);
  }
}

export class StageExecutionFailedError extends PipelineStageError {
  override readonly code = "stage_execution_failed" as const;

  constructor(
    stageId: PipelineStageId,
    detail?: string,
    options?: { providerId?: NewsProviderId; retryable?: boolean; cause?: unknown },
  ) {
    super(stageId, detail ?? `Stage "${stageId}" execution failed.`, options);
  }
}

export class UpstreamStageFailureError extends PipelineStageError {
  override readonly code = "upstream_failure" as const;

  constructor(stageId: PipelineStageId, upstreamStageId: PipelineStageId) {
    super(
      stageId,
      `Stage "${stageId}" cannot run: upstream stage "${upstreamStageId}" failed.`,
      { retryable: false },
    );
  }
}

export class ValidationFailedError extends IngestionEngineError {
  override readonly code = "validation_failed" as const;

  constructor(message: string, cause?: unknown) {
    super(message, { retryable: false, cause });
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}

export class NormalizationFailedError extends IngestionEngineError {
  override readonly code = "normalization_failed" as const;

  constructor(message: string, options?: { providerId?: NewsProviderId; cause?: unknown }) {
    super(message, { ...options, retryable: true });
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      providerId: this.providerId,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}

export class PersistenceFailedError extends IngestionEngineError {
  override readonly code = "persistence_failed" as const;

  constructor(message: string, options?: { cause?: unknown; retryable?: boolean }) {
    super(message, {
      stageId: "persistence",
      retryable: options?.retryable ?? true,
      cause: options?.cause,
    });
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      stageId: this.stageId,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}

export class UnknownIngestionError extends IngestionEngineError {
  override readonly code = "unknown" as const;

  constructor(message: string, options?: { cause?: unknown; retryable?: boolean }) {
    super(message, { retryable: options?.retryable ?? false, cause: options?.cause });
  }

  toPayload(): IngestionErrorPayload {
    return {
      code: this.code,
      message: this.message,
      providerId: this.providerId,
      stageId: this.stageId,
      retryable: this.retryable,
      cause: this.cause,
    };
  }
}
