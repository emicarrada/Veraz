import type { NormalizeStage } from "@/lib/news-ingestion/pipeline/normalize-stage";
import type { PipelineContext } from "@/lib/news-ingestion/pipeline/pipeline-stage";
import type { NormalizedArticle, ProviderPayload } from "@/lib/news-ingestion/types/article";
import type { IngestionResult } from "@/lib/news-ingestion/types/results";
import { RssNormalizer } from "@/lib/news-ingestion/normalize/rss-normalizer";

export type RssNormalizeStageInput = {
  payload: ProviderPayload;
};

/**
 * Pipeline normalize stage backed by RssNormalizer.
 */
export class RssNormalizeStage implements NormalizeStage {
  readonly stageId = "normalize" as const;

  constructor(private readonly normalizer: RssNormalizer = new RssNormalizer()) {}

  execute(
    input: RssNormalizeStageInput,
    context: PipelineContext,
  ): Promise<IngestionResult<NormalizedArticle>> {
    return this.normalizer.normalize(input.payload, context);
  }
}
