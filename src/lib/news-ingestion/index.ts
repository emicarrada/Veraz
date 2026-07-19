/**
 * News Ingestion Engine — public API.
 *
 * Features and app code MUST import from this module only.
 * Do NOT deep-import `providers/*` from outside the Engine.
 */

export type { NewsProvider } from "@/lib/news-ingestion/contracts";
export { AbstractNewsProvider } from "@/lib/news-ingestion/contracts";

export { ProviderRegistry } from "@/lib/news-ingestion/registry";

export type {
  NewsProviderId,
  KnownNewsProviderId,
  ProviderCapability,
  IngestionCandidate,
  ProviderPayload,
  NormalizedArticle,
  IngestionResult,
  DiscoverResult,
  FetchResult,
  DiscoverInput,
  DiscoverOutput,
  FetchInput,
  FetchOutput,
  ProviderHealth,
  ProviderHealthStatus,
  IngestionPipelineStatus,
  PipelineState,
  PipelineError,
  PipelineErrorRecord,
  RetryPolicy,
  ValidatedArticle,
  ValidationOutput,
  ValidationRejection,
  DedupeDecision,
  DedupeOutput,
  StoryAssignment,
  StoryStageOutput,
  ReadyArticle,
  PersistenceOutput,
  PublishOutput,
  EnrichmentOutput,
  ReferenceDraft,
} from "@/lib/news-ingestion/types";

export {
  PROVIDER_CAPABILITIES,
  DEFAULT_RETRY_POLICY,
  TERMINAL_PIPELINE_STATUSES,
} from "@/lib/news-ingestion/types";

export { NEWS_PROVIDER_IDS } from "@/lib/news-ingestion/types/provider-id";

export type {
  IngestionError,
  IngestionErrorCode,
  PipelineStageId,
  PipelineErrorCode,
} from "@/lib/news-ingestion/errors";

export {
  IngestionEngineError,
  ProviderNotImplementedError,
  ProviderNotRegisteredError,
  DuplicateProviderRegistrationError,
  StageNotImplementedError,
  PersistenceFailedError,
} from "@/lib/news-ingestion/errors";

export type {
  PipelineContext,
  PipelineStage,
  IngestionPipeline,
  DiscoverStage,
  FetchStage,
  NormalizeStage,
  ValidateStage,
  DedupeStage,
  StoryStage,
  EnrichmentStage,
  PersistenceStage,
  PublishStage,
} from "@/lib/news-ingestion/pipeline";

export {
  AbstractDiscoverStage,
  AbstractFetchStage,
  AbstractNormalizeStage,
  AbstractValidateStage,
  AbstractDedupeStage,
  AbstractStoryStage,
  AbstractEnrichmentStage,
  AbstractPersistenceStage,
  AbstractPublishStage,
} from "@/lib/news-ingestion/pipeline";

export type { Normalizer } from "@/lib/news-ingestion/normalize";
export { AbstractNormalizer, RssNormalizer } from "@/lib/news-ingestion/normalize";

export type { ArticleValidator } from "@/lib/news-ingestion/validation";
export { AbstractArticleValidator } from "@/lib/news-ingestion/validation";

export type { DedupeStrategy } from "@/lib/news-ingestion/dedupe";
export { AbstractDedupeStrategy } from "@/lib/news-ingestion/dedupe";

export type { StoryEngine } from "@/lib/news-ingestion/story";
export { AbstractStoryEngine } from "@/lib/news-ingestion/story";

export type { ArticlePersister } from "@/lib/news-ingestion/persistence";
export { AbstractArticlePersister } from "@/lib/news-ingestion/persistence";

export type { ArticlePublisher } from "@/lib/news-ingestion/publish";
export { AbstractArticlePublisher } from "@/lib/news-ingestion/publish";

export { RSSProvider } from "@/lib/news-ingestion/providers/rss";
export {
  RssIngestionRunner,
  type RssIngestionRunInput,
  type RssIngestionRunOutput,
} from "@/lib/news-ingestion/pipeline/rss-ingestion-runner";

export {
  RssIngestionPersistenceRunner,
  createRssIngestionPersistenceRunner,
  type RssIngestionPersistenceOutput,
} from "@/lib/news-ingestion/pipeline/rss-ingestion-persistence-runner";

export {
  NormalizedArticleMapper,
  buildArticleSlug,
  type MappedArticleBundle,
} from "@/lib/news-ingestion/mappers";

export {
  NormalizedArticlePersistenceService,
  type NormalizedArticlePersistenceOutput,
  type ArticlePersistenceResult,
} from "@/lib/news-ingestion/persistence";
