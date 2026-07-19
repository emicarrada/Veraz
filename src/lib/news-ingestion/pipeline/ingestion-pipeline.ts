import type { DiscoverStage } from "@/lib/news-ingestion/pipeline/discover-stage";
import type { FetchStage } from "@/lib/news-ingestion/pipeline/fetch-stage";
import type { NormalizeStage } from "@/lib/news-ingestion/pipeline/normalize-stage";
import type { ValidateStage } from "@/lib/news-ingestion/pipeline/validate-stage";
import type { DedupeStage } from "@/lib/news-ingestion/pipeline/dedupe-stage";
import type { StoryStage } from "@/lib/news-ingestion/pipeline/story-stage";
import type { EnrichmentStage } from "@/lib/news-ingestion/pipeline/enrichment-stage";
import type { PersistenceStage } from "@/lib/news-ingestion/pipeline/persistence-stage";
import type { PublishStage } from "@/lib/news-ingestion/pipeline/publish-stage";

/**
 * Contract for the full ingestion pipeline orchestrator (not implemented).
 */
export type IngestionPipeline = {
  readonly discoverStage: DiscoverStage;
  readonly fetchStage: FetchStage;
  readonly normalizeStage: NormalizeStage;
  readonly validateStage: ValidateStage;
  readonly dedupeStage: DedupeStage;
  readonly storyStage: StoryStage;
  readonly enrichmentStage: EnrichmentStage;
  readonly persistenceStage: PersistenceStage;
  readonly publishStage: PublishStage;
};
