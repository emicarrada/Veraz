export type {
  IngestionErrorCode,
  PipelineErrorCode,
  PipelineStageId,
} from "@/lib/news-ingestion/errors/codes";

export {
  IngestionEngineError,
  type IngestionErrorPayload,
  type PipelineErrorPayload,
} from "@/lib/news-ingestion/errors/base";

export {
  ProviderNotImplementedError,
  ProviderUnconfiguredError,
  ProviderUnavailableError,
  ProviderNotRegisteredError,
  DuplicateProviderRegistrationError,
  ProviderRateLimitedError,
  ProviderTimeoutError,
  ProviderParseFailureError,
  ProviderNotFoundError,
  ProviderPolicyViolationError,
  InvalidIngestionInputError,
} from "@/lib/news-ingestion/errors/provider-errors";

export {
  StageNotImplementedError,
  StageInputInvalidError,
  StageExecutionFailedError,
  UpstreamStageFailureError,
  ValidationFailedError,
  NormalizationFailedError,
  PersistenceFailedError,
  UnknownIngestionError,
} from "@/lib/news-ingestion/errors/pipeline-errors";

export type { IngestionError } from "@/lib/news-ingestion/errors/ingestion-error-type";
