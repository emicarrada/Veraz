export type { PipelineContext, PipelineStage } from "@/lib/news-ingestion/pipeline/pipeline-stage";

export type { DiscoverStage, DiscoverStageInput } from "@/lib/news-ingestion/pipeline/discover-stage";
export { AbstractDiscoverStage } from "@/lib/news-ingestion/pipeline/discover-stage";

export type { FetchStage, FetchStageInput, FetchStageOutput } from "@/lib/news-ingestion/pipeline/fetch-stage";
export { AbstractFetchStage } from "@/lib/news-ingestion/pipeline/fetch-stage";

export type { NormalizeStage, NormalizeStageInput } from "@/lib/news-ingestion/pipeline/normalize-stage";
export { AbstractNormalizeStage } from "@/lib/news-ingestion/pipeline/normalize-stage";

export type { ValidateStage, ValidateStageInput } from "@/lib/news-ingestion/pipeline/validate-stage";
export { AbstractValidateStage } from "@/lib/news-ingestion/pipeline/validate-stage";

export type { DedupeStage, DedupeStageInput } from "@/lib/news-ingestion/pipeline/dedupe-stage";
export { AbstractDedupeStage } from "@/lib/news-ingestion/pipeline/dedupe-stage";

export type { StoryStage, StoryStageInput } from "@/lib/news-ingestion/pipeline/story-stage";
export { AbstractStoryStage } from "@/lib/news-ingestion/pipeline/story-stage";

export type { EnrichmentStage, EnrichmentStageInput } from "@/lib/news-ingestion/pipeline/enrichment-stage";
export { AbstractEnrichmentStage } from "@/lib/news-ingestion/pipeline/enrichment-stage";

export type { PersistenceStage, PersistenceStageInput } from "@/lib/news-ingestion/pipeline/persistence-stage";
export { AbstractPersistenceStage } from "@/lib/news-ingestion/pipeline/persistence-stage";

export type { PublishStage, PublishStageInput } from "@/lib/news-ingestion/pipeline/publish-stage";
export { AbstractPublishStage } from "@/lib/news-ingestion/pipeline/publish-stage";

export type { IngestionPipeline } from "@/lib/news-ingestion/pipeline/ingestion-pipeline";

export {
  RssIngestionRunner,
  type RssIngestionRunInput,
  type RssIngestionRunOutput,
} from "@/lib/news-ingestion/pipeline/rss-ingestion-runner";

export { RssNormalizeStage } from "@/lib/news-ingestion/pipeline/rss-normalize-stage";
export { RssValidateStage } from "@/lib/news-ingestion/pipeline/rss-validate-stage";
