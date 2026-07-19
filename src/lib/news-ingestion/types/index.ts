export type {
  NewsProviderId,
  KnownNewsProviderId,
  NEWS_PROVIDER_IDS,
} from "@/lib/news-ingestion/types/provider-id";

export type { ProviderCapability } from "@/lib/news-ingestion/types/capabilities";
export { PROVIDER_CAPABILITIES } from "@/lib/news-ingestion/types/capabilities";

export type { IngestionInstant, IngestionUrl } from "@/lib/news-ingestion/types/primitives";

export type {
  IngestionCandidate,
  IngestionCandidateId,
  DiscoverInput,
  DiscoverOutput,
  FetchInput,
  FetchOutput,
  ProviderPayload,
  ReferenceDraft,
  NormalizedArticle,
} from "@/lib/news-ingestion/types/article";

export type {
  IngestionResult,
  DiscoverResult,
  FetchResult,
} from "@/lib/news-ingestion/types/results";

export type { ProviderHealth, ProviderHealthStatus } from "@/lib/news-ingestion/types/health";

export type {
  IngestionPipelineStatus,
  PipelineState,
  PipelineErrorRecord,
  RetryPolicy,
} from "@/lib/news-ingestion/types/pipeline-state";

export { DEFAULT_RETRY_POLICY, TERMINAL_PIPELINE_STATUSES } from "@/lib/news-ingestion/types/pipeline-state";

export type {
  ValidatedArticle,
  ValidationRejection,
  ValidationOutput,
} from "@/lib/news-ingestion/types/validation";

export type {
  DedupeDecisionType,
  DedupeDecision,
  DedupeOutput,
  StoryAssignmentAction,
  StoryAssignment,
  StoryStageOutput,
} from "@/lib/news-ingestion/types/dedupe-story";

export type {
  ReadyArticle,
  PersistenceOutput,
  PublishOutput,
  EnrichmentOutput,
} from "@/lib/news-ingestion/types/stages-io";

export type { PipelineError } from "@/lib/news-ingestion/types/pipeline-error";
